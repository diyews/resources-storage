#!/bin/sh

. /etc/profile.d/custom_env.sh

WEBHOOK_KEY=$WECHAT_PUSH_STATUS
WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${WEBHOOK_KEY}"
CUSTOM_ID=${WECHAT_DEV_NAME:=WECHAT_DEV}
NOW_TIME=$(date "+%Y-%m-%d %H:%M:%S")

# line 4. 获取系统开机运行时间
UPTIME=$(uptime | awk -F' up |,  load average: ' '{print $2", "$3}')

# line last. 遍历读取所有 thermal_zone 温度
TEMP_INFO=""
for zone in /sys/class/thermal/thermal_zone*; do
    if [ -f "${zone}/type" ] && [ -f "${zone}/temp" ]; then
        ZONE_TYPE=$(cat "${zone}/type")
        RAW_TEMP=$(cat "${zone}/temp")
        # 原始数值是毫摄氏度，除以1000转为℃
        TEMP_C=$(( ${RAW_TEMP#-} > 1000 ? RAW_TEMP / 1000 : RAW_TEMP ))
        TEMP_INFO="${TEMP_INFO}${ZONE_TYPE}: ${TEMP_C}℃  
"
    fi
done

# ============================================================
# 函数: get_up_ipv4_addrs
# 描述: 获取所有 state UP 网络接口的 IPv4 地址
# ============================================================
get_up_ipv4_addrs() {
    ip -4 addr show | awk '
        /^[0-9]+:/ {
            iface = $2
            gsub(/:/, "", iface)
            is_up = ($0 ~ /state UP/) ? 1 : 0
            next
        }
        /inet / && is_up {
            split($2, a, "/")
            # print iface, a[1]
            print a[1]
        }
    '
}

# line 5, 通过 `easytier-cli peer`命令查看ip, hostname, 
# 判断是否有可疑设备存在
if [ -n "$WECHAT_CHECK_UNEXPECTED_DEV" ]; then
  OTHER_DEV_LIST=$(easytier-cli peer 2>/dev/null \
         | sed 's/ *| */|/g' \
         | awk -F'|' '$2 ~ /^10/ && $3 !~ /^(Xiao|Vi_|St_)/ {print $3}')
fi

# 拼接完整消息
MSG_CONTENT="【状态上报】
当前时间：${NOW_TIME}
设备ID：${CUSTOM_ID}
设备IP：$(get_up_ipv4_addrs)
开机时长：${UPTIME}
${OTHER_DEV_LIST:+可疑设备：${OTHER_DEV_LIST}
}硬件温度：
${TEMP_INFO}"

# 发送企业微信机器人
RESULT=$(curl -s -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"${MSG_CONTENT}\"}}")

echo "${RESULT}"
echo ""
