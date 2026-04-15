@echo off
chcp 65001 >nul
title My Toolkit - 个人工具集

echo.
echo  ======================================
echo   ⚡ My Toolkit - 个人工具集
echo  ======================================
echo.

:: 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [错误] 未检测到 Node.js！
    echo.
    echo  请先安装 Node.js：https://nodejs.org
    echo  推荐安装 LTS 版本（v18 或更高）
    echo.
    pause
    exit /b 1
)

echo  Node.js 版本: 
node --version
echo.
echo  正在启动服务...
echo  启动后请在浏览器打开: http://localhost:3000
echo.

:: 自动打开浏览器（延迟2秒等待服务启动）
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: 启动服务
node api/server.js

pause
