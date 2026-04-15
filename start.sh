#!/bin/bash

echo ""
echo " ======================================"
echo "  ⚡ My Toolkit - 个人工具集"
echo " ======================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo " [错误] 未检测到 Node.js！"
    echo ""
    echo " 请先安装 Node.js：https://nodejs.org"
    echo " 推荐安装 LTS 版本（v18 或更高）"
    echo ""
    exit 1
fi

echo " Node.js 版本: $(node --version)"
echo ""
echo " 正在启动服务..."
echo " 启动后请在浏览器打开: http://localhost:3000"
echo ""

# macOS 自动打开浏览器
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 2 && open http://localhost:3000) &
# Linux 尝试打开浏览器
elif command -v xdg-open &> /dev/null; then
    (sleep 2 && xdg-open http://localhost:3000) &
fi

# 启动服务
node api/server.js
