# ⚡ My Toolkit 安装与使用指南

> 33 个个人效率工具集，支持浏览器直接使用和 AI Agent 调用

---

## 📋 系统要求

- **Node.js** v14.0.0 或更高版本
- 任意现代浏览器（Chrome、Edge、Firefox、Safari）

**检查 Node.js 是否已安装：**
```bash
node --version
```

如果未安装，请前往 [https://nodejs.org](https://nodejs.org) 下载 LTS 版本。

---

## 🚀 快速开始

### Windows 用户（推荐）

双击 `start.bat` 即可启动，服务器启动后浏览器会自动打开工具集主页。

### macOS / Linux 用户

```bash
# 赋予执行权限（首次运行需要）
chmod +x start.sh

# 启动
./start.sh
```

### 手动启动

```bash
node api/server.js
```

启动成功后，在浏览器访问：**http://localhost:3000**

---

## 🌐 访问地址

| 地址 | 说明 |
|------|------|
| http://localhost:3000 | 🏠 工具集主页（33个工具导航）|
| http://localhost:3000/api-docs | 📋 API 文档说明页 |
| http://localhost:3000/api/tools | 🔧 获取所有工具列表（JSON）|
| http://localhost:3000/api/tools/ai | 🤖 获取 AI 可调用工具定义（OpenAI 格式）|

---

## 🛠️ 工具列表（33个）

### 🔧 开发工具
| 工具 | 功能 |
|------|------|
| JSON 格式化/压缩 | 美化、压缩、校验 JSON |
| Base64 编解码 | 文本/文件 Base64 处理 |
| 正则表达式测试器 | 实时高亮匹配 |
| UUID 生成器 | 批量生成 UUID v4 |
| Hash 计算器 | MD5/SHA-1/SHA-256/SHA-512 |
| JWT 解析器 | 解码 JWT Token |
| URL 编解码 | URL 编码/解码/参数解析 |
| Cron 表达式助手 | 可视化生成 Cron 表达式 |
| 颜色转换器 | HEX/RGB/HSL 互转 |
| 进制转换器 | 二/八/十/十六进制互转 |
| API 接口文档模板 | 生成标准 API 文档 |
| 流程图制作 | Mermaid 语法流程图 |

### 📊 数据处理
| 工具 | 功能 |
|------|------|
| CSV↔JSON 转换 | 双向格式转换 |
| 文本 Diff 对比 | 逐行差异高亮 |
| Markdown 预览 | 实时渲染预览 |
| SQL 格式化 | SQL 美化/压缩 |
| 数据脱敏工具 | 手机号/身份证/邮箱脱敏 |
| 图片工具箱 | 压缩/格式转换/Base64 |

### 📅 项目管理
| 工具 | 功能 |
|------|------|
| 甘特图生成器 | 项目排期可视化 |
| 需求优先级矩阵 | 四象限优先级管理 |
| 每日站会助手 | 生成标准站会汇报 |
| 会议纪要生成器 | 自动格式化会议纪要 |
| Bug 报告生成器 | 规范格式 Bug 报告 |
| 项目倒计时 | 多节点 Deadline 提醒 |

### ✍️ 文档写作
| 工具 | 功能 |
|------|------|
| 周报智能助手 | 生成结构化工作周报 |
| PPT 大纲生成器 | 生成演示文稿大纲 |
| 技术方案模板 | 标准化技术方案文档 |

### 🔎 运维排查
| 工具 | 功能 |
|------|------|
| HTTP 状态码速查 | 完整 1xx-5xx 说明 |
| 日志分析工具 | 关键字过滤与统计 |
| 命令速查手册 | Git/Docker/Linux 命令 |
| 环境配置对比 | .env/JSON/YAML 对比 |

### ⚡ 工作效率
| 工具 | 功能 |
|------|------|
| 番茄钟 & 专注计时 | 番茄工作法计时器 |
| 代码片段管理器 | 收藏/搜索代码片段 |
| 密码生成器 | 安全随机密码生成 |
| 文本批处理工具 | 去重/排序/替换 |

---

## 🤖 AI Agent 集成

工具集支持 OpenAI Function Call 标准，可供 AI Agent 直接调用。

### 获取工具定义

```bash
GET http://localhost:3000/api/tools/ai
```

返回 OpenAI Function Call 格式的工具定义，共 33 个工具。

### 调用工具示例

```bash
# JSON 格式化
curl -X POST http://localhost:3000/api/exec/json-formatter \
  -H "Content-Type: application/json" \
  -d '{"input": "{\"a\":1}", "action": "format"}'

# 生成密码
curl -X POST http://localhost:3000/api/exec/password-gen \
  -H "Content-Type: application/json" \
  -d '{"length": 16, "count": 3}'

# Hash 计算
curl -X POST http://localhost:3000/api/exec/hash-calculator \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World", "algorithm": "sha256"}'
```

---

## 🧪 运行测试

服务启动后，可运行全量测试验证所有工具：

```bash
node test-all.js
```

预期输出：`30/30 成功`

---

## ❓ 常见问题

**Q: 端口 3000 被占用怎么办？**  
A: 修改 `api/server.js` 中的 `const PORT = 3000;` 改为其他端口（如 3001）。

**Q: 打开浏览器显示空白？**  
A: 确认服务已启动，且访问地址为 `http://localhost:3000`（不是 `file://`）。

**Q: 工具数据会保存吗？**  
A: 部分工具（代码片段、番茄钟等）数据保存在浏览器本地存储中，清除浏览器缓存会丢失。

---

**版本**: 1.0.0 | **更新**: 2026-03-23
