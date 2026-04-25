#!/usr/bin/env zsh
# ============================================================
# publish.sh — ToolKit 一键发布脚本
# 流程：git commit → git push → wrangler pages deploy → 上线
# 线上地址：https://toolkit-3ur.pages.dev
#
# 用法：
#   ./publish.sh                       # 交互模式，自动提示输入 message
#   ./publish.sh "feat: 新增工具"       # 直接指定 commit message
#   ./publish.sh "fix: bug" --no-all   # 不自动 git add -A（手动 add 后使用）
#   ./publish.sh --deploy-only         # 跳过 git 操作，仅部署当前文件到 Cloudflare
# ============================================================

set -e

# ---------- 颜色 ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# ---------- 配置 ----------
CF_PROJECT="toolkit"
CF_DOMAIN="toolkit-3ur.pages.dev"

# ---------- 路径 ----------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "${CYAN}${BOLD}🚀 ToolKit 一键发布${RESET}"
echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# ---------- 参数解析 ----------
COMMIT_MSG=""
ADD_ALL=true
DEPLOY_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --no-all)     ADD_ALL=false ;;
    --deploy-only) DEPLOY_ONLY=true ;;
    *)            [ -z "$COMMIT_MSG" ] && COMMIT_MSG="$arg" ;;
  esac
done

# ====================================================================
# 模式：仅部署（跳过 git）
# ====================================================================
if [ "$DEPLOY_ONLY" = true ]; then
  echo "${YELLOW}⚠️  --deploy-only 模式：跳过 git，直接部署当前文件${RESET}"
  echo ""
  echo "☁️  部署到 Cloudflare Pages（${CYAN}${CF_PROJECT}${RESET}）..."
  echo "${DIM}   排除：node_modules, .git, dist-electron, .workbuddy, needs, electron/gen_*.py${RESET}"
  npx wrangler pages deploy . \
    --project-name="$CF_PROJECT" \
    --branch=main \
    --commit-dirty=true \
    --skip-binding \
    --no-bundle

  echo ""
  echo "${GREEN}${BOLD}✅ 部署完成！${RESET}"
  echo "🔗 线上地址：${CYAN}https://${CF_DOMAIN}${RESET}"
  echo ""
  exit 0
fi

# ====================================================================
# 正常模式：git commit → push → wrangler deploy
# ====================================================================

# ---------- 检查 git 仓库 ----------
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "${RED}❌ 当前目录不是 git 仓库${RESET}"
  exit 1
fi

REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE" ]; then
  echo "${RED}❌ 未设置 git remote origin${RESET}"
  exit 1
fi
echo "📦 仓库：${CYAN}$REMOTE${RESET}"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "🌿 分支：${CYAN}$BRANCH${RESET}"

# ---------- 检查工作区状态 ----------
echo ""
echo "${BOLD}📋 当前改动：${RESET}"
git status --short

if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo ""
  echo "${YELLOW}⚠️  没有任何改动，跳过 git commit，直接部署当前状态${RESET}"
  echo ""
  printf "${BOLD}☁️  是否直接部署到 Cloudflare Pages？[Y/n] ${RESET}"
  read -r DEPLOY_ANYWAY
  if [[ "$DEPLOY_ANYWAY" =~ ^[Nn]$ ]]; then
    echo "已取消。"
    exit 0
  fi
else
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
  git push origin "$BRANCH" || echo "${YELLOW}⚠️  push 失败，但继续尝试部署${RESET}"
fi

# ---------- wrangler pages deploy ----------
echo ""
echo "☁️  部署到 Cloudflare Pages（${CYAN}${CF_PROJECT}${RESET}）..."
echo "${DIM}   排除：node_modules, .git, dist-electron, .workbuddy, needs${RESET}"
npx wrangler pages deploy . \
  --project-name="$CF_PROJECT" \
  --branch=main \
  --commit-dirty=true \
  --skip-binding \
  --no-bundle

# ---------- 完成 ----------
echo ""
echo "${GREEN}${BOLD}✅ 发布成功！${RESET}"
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo "📌 Commit：${CYAN}$(git log -1 --format='%h %s')${RESET}"
echo "🔗 线上地址：${CYAN}https://${CF_DOMAIN}${RESET}"
echo "📊 Dashboard：${CYAN}https://dash.cloudflare.com${RESET}"
echo ""
