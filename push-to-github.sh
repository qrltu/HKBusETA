#!/bin/bash
# 一键创建 GitHub 仓库 HKBusETA 并推送（只放当前源码，Public）
# 用法：
#   方式1（已在本机 WorkBuddy 授权 GitHub）：
#     source /root/.codebuddy/skills/github-connector/scripts/get_token.sh github
#     bash /workspace/bus-pwa/push-to-github.sh
#   方式2（用 PAT）：
#     GITHUB_TOKEN=你的token bash /workspace/bus-pwa/push-to-github.sh
#
# 注意：脚本不会打印 token 值。

set -e
REPO="HKBusETA"
OWNER=""
if [ -z "${GITHUB_TOKEN}" ]; then
  echo "错误：未检测到 GITHUB_TOKEN。请先按上面用法设置 token 后再运行。" >&2
  exit 1
fi

# 1. 确认 token 有效并取到用户名
ME=$(curl -s -H "Authorization: Bearer ${GITHUB_TOKEN}" https://api.github.com/user \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('login',''))" 2>/dev/null || true)
if [ -z "$ME" ]; then
  echo "错误：Token 无效或已过期（无法读取用户信息），请检查后重试。" >&2
  exit 1
fi
echo "已认证 GitHub 账号：$ME"

# 2. 创建仓库（已存在会返回错误，忽略后继续）
echo "正在创建 Public 仓库 ${ME}/${REPO} ..."
curl -s -o /dev/null -w "  HTTP %{http_code}\n" \
  -X POST -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"${REPO}\",\"description\":\"Hong Kong bus real-time arrival PWA (KMB/CTB/NLB) with schedule-based ETA\",\"homepage\":\"https://a3c1438eb28ab453b.app.workbuddy.host/?sharecode=LZ3H55GS7P\",\"private\":false,\"has_issues\":true,\"has_wiki\":false}"

# 3. 设置远程并推送（token 只用于本次推送，不写入 git config）
cd /workspace/bus-pwa
git remote remove origin 2>/dev/null || true
git remote add origin "https://oauth2:${GITHUB_TOKEN}@github.com/${ME}/${REPO}.git"
echo "正在推送 main 分支..."
git push -u origin main

# 4. 清理远程 URL 中的 token（避免明文残留）
git remote set-url origin "https://github.com/${ME}/${REPO}.git"
echo ""
echo "完成！仓库地址：https://github.com/${ME}/${REPO}"
echo "远程 URL 已清理为不含 token 的 https 地址。"
