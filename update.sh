#!/usr/bin/env bash
set -euo pipefail

# ===== 配置区 =====
OWNER="diyews"
REPO="resources-storage"
BRANCH="linux_scripts"
VERSION_FILE="version.txt"          # 仓库里的版本文件名
UPDATE_SCRIPT="update.sh"       # 自身脚本名，避免被 ZIP 覆盖时自杀
WORKDIR="$(cd "$(dirname "$0")" && pwd)"
TMPDIR="$(mktemp -d)"
REMOTE_VERSION_URL="https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${VERSION_FILE}"
ZIP_URL="https://github.com/${OWNER}/${REPO}/archive/refs/heads/${BRANCH}.zip"

cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT INT TERM

# ===== 1. 读本地版本 =====
LOCAL_VER="$(cat "$WORKDIR/$VERSION_FILE" 2>/dev/null || echo "0")"

# ===== 2. 取远程版本并比对 =====
REMOTE_VER="$(curl -fsSL --max-time 30 "$REMOTE_VERSION_URL" 2>/dev/null || echo "")"
if [[ -z "$REMOTE_VER" ]]; then
  echo "✗ 无法获取远程版本，可能是网络问题或仓库私有。退出。"
  exit 1
fi

echo "本地版本: $LOCAL_VER | 远程版本: $REMOTE_VER"
if [[ "$LOCAL_VER" == "$REMOTE_VER" ]]; then
  echo "✓ 已是最新，无需更新。"
  exit 0
fi

# ===== 3. 下载 ZIP 到临时文件 =====
echo "↓ 下载更新包..."
ZIP_PATH="$TMPDIR/repo.zip"
if ! curl -fL --max-time 120 -o "$ZIP_PATH" "$ZIP_URL"; then
  echo "✗ ZIP 下载失败，本地文件不受影响。"
  exit 1
fi

# ===== 4. 解压并校验 =====
echo "⠂ 解压校验..."
unzip -q "$ZIP_PATH" -d "$TMPDIR"
INNER_DIR="$TMPDIR/${REPO}-${BRANCH}"

if [[ ! -f "$INNER_DIR/$VERSION_FILE" ]]; then
  echo "✗ ZIP 内容异常，缺少版本文件，中止覆盖。"
  exit 1
fi

# 可选：校验 ZIP 内的版本与远程一致
ZIP_VER="$(cat "$INNER_DIR/$VERSION_FILE")"
if [[ "$ZIP_VER" != "$REMOTE_VER" ]]; then
  echo "✗ ZIP 内版本($ZIP_VER)与远程($REMOTE_VER)不一致，中止。"
  exit 1
fi

# ===== 5. 原子化覆盖 =====
echo "↑ 覆盖更新文件..."
# 用 rsync 或 cp：把 ZIP 内的所有文件覆盖到当前目录
# --delete 慎用：它会删掉当前目录有而 ZIP 里没有的文件
cp -rf "$INNER_DIR"/. "$WORKDIR"/

# 防止自杀：如果自身脚本被覆盖，执行完再替换
if [[ -f "$INNER_DIR/$UPDATE_SCRIPT" ]]; then
  cp -f "$INNER_DIR/$UPDATE_SCRIPT" "$WORKDIR/$UPDATE_SCRIPT"
fi

echo "✓ 更新完成：$LOCAL_VER → $REMOTE_VER"
