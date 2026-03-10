package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// 配置区
const (
	PORT           = "7289"
	TimeWindow     = 30 * time.Second
	MaxAttempts    = 5
	CleanupInterval = 1 * time.Minute
)

type Record struct {
	Count     int
	StartTime time.Time
}

type FrpRequest struct {
	Op      string `json:"op"`
	Content struct {
		RemoteAddr string `json:"remote_addr"`
		ProxyName  string `json:"proxy_name"`
	} `json:"content"`
}

type FrpResponse struct {
	Reject       bool   `json:"reject"`
	RejectReason string `json:"reject_reason"`
	Unchange     bool   `json:"unchange"`
}

var (
	ipRecords = make(map[string]*Record)
	blacklist = make(map[string]bool)
	mu        sync.Mutex // 保证并发安全
)

func main() {
	// 定时清理过期记录
	go func() {
		for {
			time.Sleep(CleanupInterval)
			mu.Lock()
			now := time.Now()
			for ip, record := range ipRecords {
				if now.Sub(record.StartTime) > TimeWindow {
					delete(ipRecords, ip)
				}
			}
			mu.Unlock()
		}
	}()

	http.HandleFunc("/", handleFRP)

	fmt.Printf("FRP 防爆破防御服务(Go版)已启动，监听 :%s\n", PORT)
	http.ListenAndServe("127.0.0.1:"+PORT, nil)
}

func handleFRP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.NotFound(w, r)
		return
	}

	var data FrpRequest
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		sendResponse(w, false, "")
		return
	}

	if data.Op == "NewUserConn" {
		ip := strings.Split(data.Content.RemoteAddr, ":")[0]
		if ip != "" {
			mu.Lock()
			// 1. 检查黑名单
			if blacklist[ip] {
				mu.Unlock()
				fmt.Printf("[拦截] 黑名单 IP: %s\n", ip)
				sendResponse(w, true, "Your IP is blacklisted.")
				return
			}

			// 2. 速率限制
			now := time.Now()
			record, exists := ipRecords[ip]
			if !exists {
				ipRecords[ip] = &Record{Count: 1, StartTime: now}
			} else {
				if now.Sub(record.StartTime) < TimeWindow {
					record.Count++
					if record.Count > MaxAttempts {
						blacklist[ip] = true
						mu.Unlock()
						fmt.Printf("[拉黑] 触发爆破规则: %s\n", ip)
						sendResponse(w, true, "Too many connections.")
						return
					}
				} else {
					record.Count = 1
					record.StartTime = now
				}
			}
			mu.Unlock()
		}
	}

	sendResponse(w, false, "")
}

func sendResponse(w http.ResponseWriter, reject bool, reason string) {
	resp := FrpResponse{
		Reject:       reject,
		RejectReason: reason,
		Unchange:     true,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
