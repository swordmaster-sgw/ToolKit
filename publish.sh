#!/usr/bin/env zsh
# ============================================================
# publish.sh — ToolKit 一键发布脚本
# 用法：
#   ./publish.sh                       # 交互模式，自动提示输入 message
#   ./publish.sh "feat: 新增工具"       # 直接指定 commit message
#   ./publish.sh "fix: bug" --no-all   # 不自动 git add -A（手动 add 后使用）
# ============================================================

set -e  # 任意命令失败立即退出

# ---------- 颜色 ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ---------- 路径 ----------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "${CYAN}${BOLD}🚀 ToolKit 一键发布${RESET}"
echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# ---------- 参数解析 ----------
COMMIT_MSG=""
ADD_ALL=true

for arg in "$@"; do
  case "$arg" in
    --no-all) ADD_ALL=false ;;
    *) [ -z "$COMMIT_MSG" ] && COMMIT_MSG="$arg" ;;
  esac
done

# ---------- 检查 git 仓库 ----------
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "${RED}❌ 当前目录不是 git 仓库${RESET}"
  exit 1
fi

# ---------- 检查远程 ----------
REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE" ]; then
  echo "${RED}❌ 未设置 git remote origin${RESET}"
  exit 1
fi
echo "📦 仓库：${CYAN}$REMOTE${RESET}"

# ---------- 当前分支 ----------
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "🌿 分支：${CYAN}$BRANCH${RESET}"

# ---------- 检查工作区状态 ----------
echo ""
echo "${BOLD}📋 当前改动：${RESET}"
git status --short

if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo ""
  echo "${YELLOW}⚠️  没有任何改动，无需发布${RESET}"
  exit 0
fi

# ---------- 可选：更新 sitemap ----------
if [ -f "scripts/generate-sitemap.js" ]; then
  echo ""
  printf "${YELLOW}🗺  是否更新 sitemap.xml？[y/N] ${RESET}"
  read -r UPDATE_SITEMAP
  if [[ "$UPDATE_SITEMAP" =~ ^[Yy]$ ]]; then
    echo "  → 正在生成 sitemap..."
    node scripts/generate-sitemap.js > sitemap.xml && echo "  ✅ sitemap.xml 已更新" || echo "  ⚠️  sitemap 生成失败，跳过"
  fi
fi

# ---------- git add ----------
if [ "$ADD_ALL" = true ]; then
  echo ""
  echo "📂 暂存所有改动（git add -A）..."
  git add -A
else
  echo ""
  echo "${YELLOW}⚠️  --no-all 模式：使用已暂存的文件${RESET}"
fi

# ---------- commit message ----------
if [ -z "$COMMIT_MSG" ]; then
  echo ""
  printf "${BOLD}✏️  请输入 commit message（留空使用默认）：${RESET} "
  read -r COMMIT_MSG
  if [ -z "$COMMIT_MSG" ]; then
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
    COMMIT_MSG="chore: update ${TIMESTAMP}"
    echo "  → 使用默认 message：${CYAN}$COMMIT_MSG${RESET}"
  fi
fi

# ---------- 提交 ----------
echo ""
echo "💾 提交：${CYAN}$COMMIT_MSG${RESET}"
git commit -m "$COMMIT_MSG"

# ---------- push ----------
echo ""
echo "📤 推送到 GitHub..."
git push origin "$BRANCH"

# ---------- 完成 ----------
echo ""
echo "${GREEN}${BOLD}✅ 发布成功！${RESET}"
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo "📌 Commit：${CYAN}$(git log -1 --format='%h %s')${RESET}"
echo "⏱  Cloudflare Pages 通常 1~2 分钟自动完成部署"
echo "🔗 Dashboard：${CYAN}https://dash.cloudflare.com${RESET}"
echo ""
