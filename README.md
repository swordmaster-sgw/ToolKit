# ⚡ WorkBuddy - AI 开发者工具集

> 让 AI Agent 调用你的工具，构建你的私人开发者助手

## 🚀 快速开始

### 1. 启动 API 服务

```bash
cd E:\data\ai\workbuddy
node api/server.js
```

服务启动后访问：
- **主页**: http://localhost:3000
- **API**: http://localhost:3000/api/tools

### 2. 调用工具示例

```bash
# JSON 格式化
curl -X POST http://localhost:3000/api/exec/json-formatter -H "Content-Type: application/json" -d "{\"input\": \"{\\\"a\\\":1}\", \"action\": \"format\"}"

# 生成密码
curl -X POST http://localhost:3000/api/exec/password-gen -H "Content-Type: application/json" -d "{\"length\": 16, \"count\": 5}"

# Base64 编码
curl -X POST http://localhost:3000/api/exec/base64-codec -H "Content-Type: application/json" -d "{\"text\": \"Hello World\", \"action\": \"encode\"}"
```

## 📦 已实现的工具 (32个)

| 工具ID | 功能 | 状态 |
|--------|------|------|
| json-formatter | JSON 格式化/压缩/校验 | ✅ |
| base64-codec | Base64 编解码 | ✅ |
| uuid-generator | UUID 生成 | ✅ |
| hash-calculator | Hash 计算 (MD5/SHA256) | ✅ |
| url-codec | URL 编解码 | ✅ |
| jwt-decoder | JWT 解析 | ✅ |
| password-gen | 密码生成 | ✅ |
| text-process | 文本处理 (去重/排序/大小写) | ✅ |
| timestamp-converter | 时间戳转换 | ✅ |
| number-converter | 进制转换 | ✅ |
| color-converter | 颜色转换 | ✅ |
| cron-helper | Cron 解析 | ✅ |
| http-status | HTTP 状态码查询 | ✅ |
| regex-tester | 正则测试 | ✅ |
| csv-json | CSV/JSON 转换 | ✅ |
| text-diff | 文本 Diff | ✅ |
| sql-formatter | SQL 格式化 | ✅ |
| data-masking | 数据脱敏 | ✅ |
| log-analyzer | 日志分析 | ✅ |
| markdown-preview | Markdown 预览 | ✅ |
| cmd-cheatsheet | 命令速查 (Git/Docker/Linux) | ✅ |
| env-diff | 环境配置对比 | ✅ |
| bug-report | Bug 报告生成 | ✅ |
| weekly-report | 周报生成 | ✅ |
| standup-helper | 站会助手 | ✅ |
| meeting-minutes | 会议纪要 | ✅ |
| api-mock | API 文档生成 | ✅ |
| countdown-timer | 倒计时 | ✅ |
| ppt-outline | PPT 大纲 | ✅ |
| tech-doc-template | 技术文档模板 | ✅ |
| gantt-chart | 甘特图 | ✅ |
| priority-matrix | 优先级矩阵 | ✅ |

## 🧪 测试

```bash
# 测试所有工具
node test-all.js
```

## 📁 项目结构

```
workbuddy/
├── index.html          # 主页
├── tools.json          # 工具元数据
├── tools-ai-config.json # AI 配置
├── api/
│   ├── server.js       # API 服务
│   ├── tools-lib.js   # 工具函数库 (32个工具)
│   └── tools-manifest.json
└── tools/              # 各个工具页面
```

## 🔜 下一步

1. **体验**: 打开浏览器访问 http://localhost:3000
2. **测试 API**: 用 Postman 或 curl 测试各个接口
3. **集成 AI**: 通过 /api/tools/ai 获取工具定义，集成到你的 AI Agent

---
**Author**: WorkBuddy
**Updated**: 2026-03-21
