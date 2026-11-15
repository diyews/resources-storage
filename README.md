## 下载更新Script
```sh
curl -L -o update.sh https://raw.githubusercontent.com/diyews/resources-storage/refs/heads/linux_scripts/update.sh
```
```sh
chmod +x ./update.sh
```

### 配置文件路径：
```sh
vi /etc/profile.d/custom_env.sh
```
```sh
WECHAT_DEV_NAME="xxx"
WECHAT_PUSH_STATUS="xxx-xxx-xx"
WECHAT_CHECK_UNEXPECTED_DEV="" # 非空时检查easytier-cli 是否有可疑设备在线
```
---

### 计划任务配置
```
0 6,9,12,15,18,21,23 * * * /root/wechat/wechat_webhook.sh
0 23 * * * /root/wechat/leds.sh off
0 7 * * * /root/wechat/leds.sh on
```
