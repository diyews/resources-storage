#!/bin/sh

ACTION=$1
BACKUP_FILE="/tmp/led_trigger_backup"
LEDS_BASE="/sys/class/leds"

# === 自动探测包含 red/blue 的 LED 目录 ===
RED_LED=$(ls -1 "${LEDS_BASE}" 2>/dev/null | grep -i 'red' | head -n1)
BLUE_LED=$(ls -1 "${LEDS_BASE}" 2>/dev/null | grep -i 'blue' | head -n1)

if [ "$ACTION" = "off" ]; then
    # === 1. 读取并保存当前触发器模式 ===
    # RED_TRIGGER=$(cat /sys/class/leds/${RED_LED}/trigger 2>/dev/null | grep -oP '\[\K[^\]]+')
    # BLUE_TRIGGER=$(cat /sys/class/leds/${BLUE_LED}/trigger 2>/dev/null | grep -oP '\[\K[^\]]+')
    RED_TRIGGER=$(cat "${LEDS_BASE}/${RED_LED}/trigger" 2>/dev/null | sed 's/.*\[\(.*\)\].*/\1/')
    BLUE_TRIGGER=$(cat "${LEDS_BASE}/${BLUE_LED}/trigger" 2>/dev/null | sed 's/.*\[\(.*\)\].*/\1/')

    # 写入备份文件
    echo "${RED_TRIGGER}" > ${BACKUP_FILE}
    echo "${BLUE_TRIGGER}" >> ${BACKUP_FILE}
    
    # === 2. 设置为 none ===
    echo none > /sys/class/leds/${RED_LED}/trigger 2>/dev/null
    echo none > /sys/class/leds/${BLUE_LED}/trigger 2>/dev/null
    
    logger -t led_control "LED OFF: saved red=${RED_TRIGGER}, blue=${BLUE_TRIGGER}"

elif [ "$ACTION" = "on" ]; then
    # === 从备份恢复 ===
    if [ -f "${BACKUP_FILE}" ]; then
        RED_RESTORE=$(sed -n '1p' ${BACKUP_FILE})
        BLUE_RESTORE=$(sed -n '2p' ${BACKUP_FILE})
        
        echo "${RED_RESTORE}" > /sys/class/leds/${RED_LED}/trigger 2>/dev/null
        echo "${BLUE_RESTORE}" > /sys/class/leds/${BLUE_LED}/trigger 2>/dev/null
        
        logger -t led_control "LED ON: restored red=${RED_RESTORE}, blue=${BLUE_RESTORE}"
        rm -f ${BACKUP_FILE}
    else
        # 无备份时使用默认值兜底
        # echo default-on > /sys/class/leds/${RED_LED}/trigger 2>/dev/null
        # echo netdev > /sys/class/leds/${BLUE_LED}/trigger 2>/dev/null
        # logger -t led_control "LED ON: no backup found, using defaults"
        echo "No backup file, exit without any changed."
    fi
else
    echo "Usage: $0 {off|on}"
    exit 1
fi
