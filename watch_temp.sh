#!/bin/bash

# default 1s
interval="${1:-1}"

clear
while true; do
    printf '\033[H'
    printf '%-20s %s\n' "ZONE" "TEMP"
    printf '%-20s %s\n' "----" "----"
    for zone in /sys/class/thermal/thermal_zone*; do
        name=$(cat "$zone/type" 2>/dev/null)
        temp=$(cat "$zone/temp" 2>/dev/null)
        if [ -n "$temp" ]; then
            printf '%-20s %s.%s°C\n' "$name" "${temp%???}" "${temp: -3}"
        fi
    done
    printf '\033[J'
    sleep "$interval"
done

