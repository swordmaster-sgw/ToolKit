/**
 * 工具集导航站 - 核心逻辑
 * 功能：工具加载、搜索、分类筛选、文档阅读、AI 工具选择
 */

// ==================== 内嵌工具数据（解决 file:// 协议无法 fetch 的问题）====================
const TOOLS_DATA = [
  {
    "id": "json-formatter",
    "name": "JSON 格式化 / 压缩",
    "description": "JSON 格式化美化、压缩压缩、语法校验，支持树形展开，开发必备。",
    "category": "开发工具",
    "tags": ["JSON", "格式化", "校验", "压缩"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/json-formatter/index.html",
    "doc": "./tools/json-formatter/README.md",
    "icon": "📋",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "格式化或压缩 JSON 数据，检查 JSON 语法是否正确",
    "ai_params": {}
  },
  {
    "id": "regex-tester",
    "name": "正则表达式测试器",
    "description": "实时高亮匹配，支持标记(flags)，捕获组提取，常用正则快速引用。",
    "category": "开发工具",
    "tags": ["正则", "Regex", "测试", "匹配"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/regex-tester/index.html",
    "doc": "./tools/regex-tester/README.md",
    "icon": "🔍",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "测试正则表达式是否匹配目标文本",
    "ai_params": {}
  },
  {
    "id": "base64-codec",
    "name": "Base64 编解码",
    "description": "文本 / 文件 Base64 编码与解码，支持 URL-safe 模式，一键复制。",
    "category": "开发工具",
    "tags": ["Base64", "编码", "解码", "加密"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/base64-codec/index.html",
    "doc": "./tools/base64-codec/README.md",
    "icon": "🔐",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "对文本进行 Base64 编码或解码",
    "ai_params": {}
  },
  {
    "id": "timestamp-converter",
    "name": "时间戳转换",
    "description": "Unix 时间戳 ↔ 可读日期时间互转，支持毫秒/秒，显示多时区。",
    "category": "开发工具",
    "tags": ["时间戳", "时间", "日期", "转换"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/timestamp-converter/index.html",
    "doc": "./tools/timestamp-converter/README.md",
    "icon": "⏱️",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "将 Unix 时间戳转换为可读日期，或将日期转换为时间戳",
    "ai_params": {}
  },
  {
    "id": "uuid-generator",
    "name": "UUID 生成器",
    "description": "批量生成 UUID v4，支持自定义数量、格式（带/不带横杠）、大小写。",
    "category": "开发工具",
    "tags": ["UUID", "生成", "唯一标识"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/uuid-generator/index.html",
    "doc": "./tools/uuid-generator/README.md",
    "icon": "🆔",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "生成随机 UUID v4",
    "ai_params": {}
  },
  {
    "id": "hash-calculator",
    "name": "Hash 计算器",
    "description": "在线计算 MD5、SHA-1、SHA-256、SHA-512，支持文本和文件，全本地计算。",
    "category": "开发工具",
    "tags": ["Hash", "MD5", "SHA256", "摘要", "校验"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/hash-calculator/index.html",
    "doc": "./tools/hash-calculator/README.md",
    "icon": "#️⃣",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "计算文本或文件的 Hash 摘要值（MD5/SHA256等）",
    "ai_params": {}
  },
  {
    "id": "jwt-decoder",
    "name": "JWT 解析器",
    "description": "解码 JWT Token，展示 Header、Payload、签名，检查过期时间，无需密钥。",
    "category": "开发工具",
    "tags": ["JWT", "Token", "认证", "解析"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/jwt-decoder/index.html",
    "doc": "./tools/jwt-decoder/README.md",
    "icon": "🎫",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "解析 JWT Token 的内容，查看其中的用户信息和过期时间",
    "ai_params": {}
  },
  {
    "id": "url-codec",
    "name": "URL 编解码",
    "description": "URL 编码/解码、参数解析、构建完整 URL，帮助调试接口链接。",
    "category": "开发工具",
    "tags": ["URL", "编码", "解码", "参数"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/url-codec/index.html",
    "doc": "./tools/url-codec/README.md",
    "icon": "🔗",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "对 URL 进行编码或解码，解析 URL 参数",
    "ai_params": {}
  },
  {
    "id": "cron-helper",
    "name": "Cron 表达式助手",
    "description": "可视化生成 Cron 表达式，实时预览下次执行时间，支持 5 位 / 6 位格式。",
    "category": "开发工具",
    "tags": ["Cron", "定时任务", "表达式", "调度"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/cron-helper/index.html",
    "doc": "./tools/cron-helper/README.md",
    "icon": "⏰",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "生成或解析 Cron 定时表达式，查看下次执行时间",
    "ai_params": {}
  },
  {
    "id": "color-converter",
    "name": "颜色转换器",
    "description": "HEX、RGB、HSL 三种格式互转，取色板，生成渐变代码，前端开发利器。",
    "category": "开发工具",
    "tags": ["颜色", "HEX", "RGB", "HSL", "前端"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/color-converter/index.html",
    "doc": "./tools/color-converter/README.md",
    "icon": "🎨",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "在 HEX、RGB、HSL 之间转换颜色格式",
    "ai_params": {}
  },
  {
    "id": "number-converter",
    "name": "进制转换器",
    "description": "二进制、八进制、十进制、十六进制互转，支持负数，IP 地址二进制转换。",
    "category": "开发工具",
    "tags": ["进制", "二进制", "十六进制", "转换"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/number-converter/index.html",
    "doc": "./tools/number-converter/README.md",
    "icon": "🔢",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "在不同数字进制之间进行转换（二进制、十六进制等）",
    "ai_params": {}
  },
  {
    "id": "api-mock",
    "name": "API 接口文档模板",
    "description": "快速填写接口文档（请求/响应格式、状态码、示例），自动生成标准 API 文档。",
    "category": "开发工具",
    "tags": ["API", "接口文档", "模板", "开发"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/api-mock/index.html",
    "doc": "./tools/api-mock/README.md",
    "icon": "🔌",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "生成标准格式的 API 接口文档",
    "ai_params": {}
  },
  {
    "id": "csv-json",
    "name": "CSV ↔ JSON 转换",
    "description": "CSV 与 JSON 双向转换，支持自定义分隔符、表头映射，数据预览。",
    "category": "数据处理",
    "tags": ["CSV", "JSON", "转换", "数据"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/csv-json/index.html",
    "doc": "./tools/csv-json/README.md",
    "icon": "📊",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "将 CSV 数据转换为 JSON，或将 JSON 转换为 CSV",
    "ai_params": {}
  },
  {
    "id": "text-diff",
    "name": "文本 Diff 对比",
    "description": "逐行对比两段文本差异，高亮增删改，适合代码 review、配置文件对比。",
    "category": "数据处理",
    "tags": ["Diff", "对比", "代码审查", "文本"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/text-diff/index.html",
    "doc": "./tools/text-diff/README.md",
    "icon": "📝",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "对比两段文本的差异，高亮显示增删改的内容",
    "ai_params": {}
  },
  {
    "id": "markdown-preview",
    "name": "Markdown 预览",
    "description": "实时预览 Markdown 渲染效果，支持代码高亮、表格、数学公式，可导出 HTML。",
    "category": "数据处理",
    "tags": ["Markdown", "预览", "文档", "编辑"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/markdown-preview/index.html",
    "doc": "./tools/markdown-preview/README.md",
    "icon": "📄",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "预览 Markdown 文本的渲染效果",
    "ai_params": {}
  },
  {
    "id": "sql-formatter",
    "name": "SQL 格式化",
    "description": "美化 / 压缩 SQL 语句，关键字高亮，支持多种方言（MySQL、PostgreSQL、标准SQL）。",
    "category": "数据处理",
    "tags": ["SQL", "格式化", "数据库", "美化"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/sql-formatter/index.html",
    "doc": "./tools/sql-formatter/README.md",
    "icon": "🗄️",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "格式化和美化 SQL 语句，使其更易阅读",
    "ai_params": {}
  },
  {
    "id": "data-masking",
    "name": "数据脱敏工具",
    "description": "对手机号、身份证、邮箱、银行卡等敏感数据批量脱敏处理，保护数据安全。",
    "category": "数据处理",
    "tags": ["脱敏", "隐私", "安全", "数据处理"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/data-masking/index.html",
    "doc": "./tools/data-masking/README.md",
    "icon": "🛡️",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "对敏感数据（手机号、身份证等）进行脱敏处理",
    "ai_params": {}
  },
  {
    "id": "image-tools",
    "name": "图片工具箱",
    "description": "图片压缩、格式转换（PNG/JPG/WebP）、Base64编解码、尺寸调整，本地处理不上传。",
    "category": "数据处理",
    "tags": ["图片", "压缩", "转换", "Base64"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/image-tools/index.html",
    "doc": "./tools/image-tools/README.md",
    "icon": "🖼️",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "处理图片，包括压缩、格式转换和尺寸调整",
    "ai_params": {}
  },
  {
    "id": "gantt-chart",
    "name": "甘特图生成器",
    "description": "输入任务、负责人、时间范围，快速生成可视化甘特图，可复制为 Markdown 格式。",
    "category": "项目管理",
    "tags": ["甘特图", "项目", "排期", "可视化"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/gantt-chart/index.html",
    "doc": "./tools/gantt-chart/README.md",
    "icon": "📅",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "创建项目甘特图，管理任务时间线和排期",
    "ai_params": {}
  },
  {
    "id": "priority-matrix",
    "name": "需求优先级矩阵",
    "description": "基于四象限（紧急/重要）管理需求优先级，拖拽排序，导出为任务清单。",
    "category": "项目管理",
    "tags": ["优先级", "四象限", "需求管理", "项目"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/priority-matrix/index.html",
    "doc": "./tools/priority-matrix/README.md",
    "icon": "🎯",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "使用四象限矩阵管理和排列需求优先级",
    "ai_params": {}
  },
  {
    "id": "standup-helper",
    "name": "每日站会助手",
    "description": "记录昨日完成、今日计划、阻塞问题，一键生成标准站会汇报，历史可查。",
    "category": "项目管理",
    "tags": ["站会", "日报", "敏捷", "汇报"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/standup-helper/index.html",
    "doc": "./tools/standup-helper/README.md",
    "icon": "🗣️",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "记录每日站会内容，生成标准格式的站会汇报",
    "ai_params": {}
  },
  {
    "id": "meeting-minutes",
    "name": "会议纪要生成器",
    "description": "快速录入会议议题、决策、行动项，自动格式化为标准会议纪要，支持导出。",
    "category": "项目管理",
    "tags": ["会议纪要", "模板", "行动项", "会议"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/meeting-minutes/index.html",
    "doc": "./tools/meeting-minutes/README.md",
    "icon": "📋",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "记录会议内容并生成标准格式的会议纪要",
    "ai_params": {}
  },
  {
    "id": "bug-report",
    "name": "Bug 报告生成器",
    "description": "填写 Bug 现象、复现步骤、预期结果，自动生成标准 Bug 报告，可复制提交到 Jira/GitLab。",
    "category": "项目管理",
    "tags": ["Bug", "测试", "报告", "问题追踪"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/bug-report/index.html",
    "doc": "./tools/bug-report/README.md",
    "icon": "🐛",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "生成规范格式的 Bug 报告，方便提交问题追踪系统",
    "ai_params": {}
  },
  {
    "id": "countdown-timer",
    "name": "项目倒计时",
    "description": "创建多个项目节点倒计时（上线日、里程碑），桌面常驻提醒，防止 deadline 遗忘。",
    "category": "项目管理",
    "tags": ["倒计时", "Deadline", "里程碑", "提醒"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/countdown-timer/index.html",
    "doc": "./tools/countdown-timer/README.md",
    "icon": "⏳",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "创建项目节点倒计时，追踪 deadline",
    "ai_params": {}
  },
  {
    "id": "weekly-report",
    "name": "周报智能助手",
    "description": "结构化录入本周工作，智能生成格式标准的工作周报，支持多种模板。",
    "category": "文档写作",
    "tags": ["周报", "模板", "工作汇报", "写作"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/weekly-report/index.html",
    "doc": "./tools/weekly-report/README.md",
    "icon": "✍️",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "生成工作周报，整理本周完成事项和下周计划",
    "ai_params": {}
  },
  {
    "id": "ppt-outline",
    "name": "PPT 大纲生成器",
    "description": "输入汇报主题和要点，生成结构化 PPT 大纲，包含标题建议、每页核心内容。",
    "category": "文档写作",
    "tags": ["PPT", "大纲", "汇报", "演讲"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/ppt-outline/index.html",
    "doc": "./tools/ppt-outline/README.md",
    "icon": "🖥️",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "根据主题生成 PPT 演示文稿的结构化大纲",
    "ai_params": {}
  },
  {
    "id": "tech-doc-template",
    "name": "技术方案模板",
    "description": "提供标准化技术方案文档模板（背景、方案、架构图、风险、时间线），填空式生成。",
    "category": "文档写作",
    "tags": ["技术方案", "文档", "模板", "架构"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/tech-doc-template/index.html",
    "doc": "./tools/tech-doc-template/README.md",
    "icon": "📑",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "生成技术方案文档，包含背景、方案设计、风险评估等章节",
    "ai_params": {}
  },
  {
    "id": "flowchart-maker",
    "name": "流程图制作（Mermaid）",
    "description": "文本描述生成流程图，使用 Mermaid 语法，实时预览，可导出 SVG/PNG。",
    "category": "文档写作",
    "tags": ["流程图", "Mermaid", "图表", "可视化"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/flowchart-maker/index.html",
    "doc": "./tools/flowchart-maker/README.md",
    "icon": "🔀",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "使用 Mermaid 语法创建流程图、序列图等图表",
    "ai_params": {}
  },
  {
    "id": "http-status",
    "name": "HTTP 状态码速查",
    "description": "完整的 HTTP 状态码说明（1xx-5xx），含常见错误原因和排查思路，支持搜索。",
    "category": "运维排查",
    "tags": ["HTTP", "状态码", "接口", "排查"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/http-status/index.html",
    "doc": "./tools/http-status/README.md",
    "icon": "🌐",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "查询 HTTP 状态码的含义和处理建议",
    "ai_params": {}
  },
  {
    "id": "log-analyzer",
    "name": "日志分析工具",
    "description": "粘贴日志内容，提取错误/警告行，按级别分类，支持关键字高亮过滤。",
    "category": "运维排查",
    "tags": ["日志", "分析", "错误", "排查"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/log-analyzer/index.html",
    "doc": "./tools/log-analyzer/README.md",
    "icon": "🔎",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "分析和过滤日志内容，提取错误和关键信息",
    "ai_params": {}
  },
  {
    "id": "cmd-cheatsheet",
    "name": "命令速查手册",
    "description": "Git、Docker、Linux、Nginx、Python 等常用命令速查，支持关键字搜索，收藏常用。",
    "category": "运维排查",
    "tags": ["命令", "Git", "Docker", "Linux", "速查"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/cmd-cheatsheet/index.html",
    "doc": "./tools/cmd-cheatsheet/README.md",
    "icon": "💻",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "查询 Git、Docker、Linux 等常用命令的用法",
    "ai_params": {}
  },
  {
    "id": "env-diff",
    "name": "环境配置对比",
    "description": "对比两个环境（开发/测试/生产）的配置文件差异，识别缺失或不一致的配置项。",
    "category": "运维排查",
    "tags": ["配置", "环境", "对比", "运维"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/env-diff/index.html",
    "doc": "./tools/env-diff/README.md",
    "icon": "⚙️",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "对比不同环境的配置文件差异",
    "ai_params": {}
  },
  {
    "id": "pomodoro",
    "name": "番茄钟 & 专注计时",
    "description": "25/5 分钟番茄工作法计时器，任务清单绑定，统计每日完成番茄数，音效提醒。",
    "category": "工作效率",
    "tags": ["番茄钟", "专注", "计时", "任务"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/pomodoro/index.html",
    "doc": "./tools/pomodoro/README.md",
    "icon": "🍅",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "使用番茄工作法计时，帮助保持专注",
    "ai_params": {}
  },
  {
    "id": "code-snippet",
    "name": "代码片段管理器",
    "description": "收藏、分类、搜索常用代码片段，支持语法高亮、一键复制，数据存本地。",
    "category": "工作效率",
    "tags": ["代码片段", "收藏", "搜索", "复用"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/code-snippet/index.html",
    "doc": "./tools/code-snippet/README.md",
    "icon": "📌",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "保存和管理常用代码片段，方便快速复用",
    "ai_params": {}
  },
  {
    "id": "password-gen",
    "name": "密码生成器",
    "description": "生成强随机密码，可配置长度、字符集（大小写、数字、符号），一键批量生成。",
    "category": "工作效率",
    "tags": ["密码", "安全", "随机", "生成"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/password-gen/index.html",
    "doc": "./tools/password-gen/README.md",
    "icon": "🔑",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "生成安全的随机密码",
    "ai_params": {}
  },
  {
    "id": "text-process",
    "name": "文本批处理工具",
    "description": "文本去重、排序、计行数、替换、大小写转换、JSON转义等多种文本操作，一站式搞定。",
    "category": "工作效率",
    "tags": ["文本", "处理", "去重", "替换", "格式化"],
    "version": "1.0.0",
    "status": "stable",
    "url": "./tools/text-process/index.html",
    "doc": "./tools/text-process/README.md",
    "icon": "📝",
    "created": "2026-03-18",
    "updated": "2026-03-18",
    "ai_callable": false,
    "ai_description": "对文本进行去重、排序、替换等批量处理",
    "ai_params": {}
  }
];

// ==================== 订阅系统 ====================
const SUBSCRIBE_STORAGE_KEY = 'toolkit_subscribed_v1';

// 默认订阅的8个核心工具
const DEFAULT_SUBSCRIBED = [
  'timestamp-converter', 'json-formatter', 'base64-codec',
  'color-converter', 'jwt-decoder', 'data-masking',
  'regex-tester', 'text-process'
];

function loadSubscribedIds() {
  try {
    const data = localStorage.getItem(SUBSCRIBE_STORAGE_KEY);
    if (data) return JSON.parse(data);
    return [...DEFAULT_SUBSCRIBED];
  } catch (e) {
    return [...DEFAULT_SUBSCRIBED];
  }
}

function saveSubscribedIds(ids) {
  try {
    localStorage.setItem(SUBSCRIBE_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {}
}

function isSubscribed(toolId) {
  return loadSubscribedIds().includes(toolId);
}

function toggleSubscribe(toolId) {
  const ids = loadSubscribedIds();
  const idx = ids.indexOf(toolId);
  if (idx > -1) {
    ids.splice(idx, 1);
  } else {
    ids.push(toolId);
  }
  saveSubscribedIds(ids);
  return idx > -1 ? 'unsubscribed' : 'subscribed';
}

// ==================== 使用频率统计 ====================
const USAGE_STORAGE_KEY = 'toolkit_usage_v1';

function loadUsageData() {
  try {
    return JSON.parse(localStorage.getItem(USAGE_STORAGE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function saveUsageData(data) {
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // 存储失败不影响主流程
  }
}

function incrementToolUsage(toolId) {
  const data = loadUsageData();
  data[toolId] = (data[toolId] || 0) + 1;
  saveUsageData(data);
  return data[toolId];
}

function getToolUsage(toolId) {
  return loadUsageData()[toolId] || 0;
}

function getAllUsageData() {
  return loadUsageData();
}

// ==================== 状态管理 ====================
const AppState = {
  tools: [],
  filtered: [],
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'usage',
  viewMode: 'grid', // grid | list
  currentTool: null,
  currentView: 'home', // home | store
};

// ==================== 类别颜色映射 ====================
const CATEGORY_COLORS = {
  '示例': '#6366f1',
  '工作效率': '#22c55e',
  '开发工具': '#3b82f6',
  '文档写作': '#f59e0b',
  '自动化': '#a855f7',
  '数据分析': '#06b6d4',
  '数据处理': '#06b6d4',
  '项目管理': '#ec4899',
  '运维排查': '#f97316',
  '生活效率': '#ec4899',
  '其他': '#8b90a7',
};

function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat] || '#8b90a7';
}

// ==================== 工具数据加载 ====================
async function loadTools() {
  // 优先尝试 fetch（HTTP 服务器场景），失败则回退到内嵌数据（file:// 本地场景）
  try {
    const resp = await fetch('./tools.json?t=' + Date.now());
    if (!resp.ok) throw new Error('加载失败');
    AppState.tools = await resp.json();
  } catch (e) {
    // file:// 协议或网络错误时，使用内嵌数据，无需报错
    console.info('使用内嵌工具数据（本地文件模式）');
    AppState.tools = TOOLS_DATA;
  }
  applyFilters();
  renderStats();

  // 检查 URL hash，决定显示哪个视图
  if (window.location.hash === '#store') {
    showStore();
  } else {
    showHome();
  }
}

// ==================== 主页 & 商城视图切换 ====================
function showHome() {
  AppState.currentView = 'home';
  document.getElementById('main-content').style.display = '';
  document.getElementById('store-page').style.display = 'none';
  window.location.hash = '';
  const subscribedIds = loadSubscribedIds();
  const subscribedTools = AppState.tools.filter(t => subscribedIds.includes(t.id));
  AppState.filtered = subscribedTools;
  renderMyTools(subscribedTools);
}

function showStore() {
  AppState.currentView = 'store';
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('store-page').style.display = '';
  window.location.hash = 'store';
  renderStorePage();
}

function renderMyTools(tools) {
  const grid = document.getElementById('tools-grid');
  const countEl = document.getElementById('tools-count');

  if (tools.length === 0) {
    grid.className = 'tools-grid';
    countEl.textContent = '暂无订阅工具';
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🏪</div>
        <h3>还没有订阅任何工具</h3>
        <p>前往工具商城，订阅你常用的工具</p>
        <button class="btn-tool btn-tool-primary" style="margin-top:16px;padding:10px 24px;font-size:14px" onclick="showStore()">前往工具商城 →</button>
      </div>`;
    return;
  }

  countEl.textContent = `我的工具 · ${tools.length} 个`;
  grid.className = 'tools-grid';
  grid.innerHTML = tools.map(tool => renderToolCard(tool)).join('');
}

function renderStorePage() {
  const container = document.getElementById('store-grid');
  if (!container) return;

  const subscribedIds = loadSubscribedIds();
  const q = (document.getElementById('store-search')?.value || '').toLowerCase().trim();
  const activeCat = window._storeCategory || 'all';

  let list = [...AppState.tools];

  // Filter by category
  if (activeCat !== 'all') {
    list = list.filter(t => t.category === activeCat);
  }

  // Search
  if (q) {
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }

  container.innerHTML = list.map(tool => {
    const sub = subscribedIds.includes(tool.id);
    return renderStoreCard(tool, sub);
  }).join('');

  // Update store count
  const countEl = document.getElementById('store-count');
  if (countEl) countEl.textContent = `共 ${list.length} 个工具`;

  // Render store category tabs
  renderStoreCategoryTabs();
}

function renderStoreCategoryTabs() {
  const cats = ['all', ...new Set(AppState.tools.map(t => t.category))];
  const container = document.getElementById('store-filter-tabs');
  if (!container) return;
  const counts = {};
  AppState.tools.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });

  container.innerHTML = cats.map(cat => {
    const isAll = cat === 'all';
    const label = isAll ? '全部' : cat;
    const count = isAll ? AppState.tools.length : (counts[cat] || 0);
    const active = (window._storeCategory || 'all') === cat ? 'active' : '';
    return `<button class="filter-tab ${active}" onclick="setStoreCategory('${cat}')">
      ${!isAll ? `<span class="category-dot" style="background:${getCategoryColor(cat)}"></span>` : ''}
      ${label} <span style="opacity:0.6;font-size:11px;margin-left:2px">${count}</span>
    </button>`;
  }).join('');
}

function setStoreCategory(cat) {
  window._storeCategory = cat;
  renderStorePage();
}

function renderStoreCard(tool, isSubscribed) {
  const statusMap = { stable: '稳定', beta: '测试', dev: '开发中', deprecated: '已废弃' };
  const statusLabel = statusMap[tool.status] || tool.status;
  const subClass = isSubscribed ? 'subscribed' : '';
  const subText = isSubscribed ? '✓ 已订阅' : '+ 订阅';
  const tagsHtml = (tool.tags || []).slice(0, 3).map(tag =>
    `<span class="tool-tag">${tag}</span>`
  ).join('');

  return `
    <div class="store-card ${subClass}">
      <div class="tool-card-header">
        <div class="tool-icon">${tool.icon || '🔧'}</div>
        <div style="flex:1">
          <div class="tool-name">${tool.name}</div>
          <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
            <span class="tool-status ${tool.status}">${statusLabel}</span>
          </div>
        </div>
      </div>
      <div class="tool-description">${tool.description}</div>
      ${tagsHtml ? `<div class="tool-tags">${tagsHtml}</div>` : ''}
      <div class="store-card-footer">
        <span style="display:flex;align-items:center;gap:4px">
          <span class="category-dot" style="background:${getCategoryColor(tool.category)}"></span>
          ${tool.category}
        </span>
        <div style="display:flex;gap:8px;align-items:center">
          ${tool.url ? `<a class="btn-tool btn-tool-ghost" href="${tool.url}" onclick="incrementToolUsage('${tool.id}')" target="_blank">打开</a>` : ''}
          <button class="btn-tool ${isSubscribed ? 'btn-tool-unsub' : 'btn-tool-sub'}" onclick="handleSubscribe('${tool.id}', this)">${subText}</button>
        </div>
      </div>
    </div>`;
}

function handleSubscribe(toolId, btn) {
  const action = toggleSubscribe(toolId);
  const isNowSub = action === 'subscribed';
  btn.className = `btn-tool ${isNowSub ? 'btn-tool-unsub' : 'btn-tool-sub'}`;
  btn.textContent = isNowSub ? '✓ 已订阅' : '+ 订阅';

  // Update card class
  const card = btn.closest('.store-card');
  if (card) {
    card.classList.toggle('subscribed', isNowSub);
  }

  showToast(isNowSub ? '已订阅，工具已添加到主页' : '已取消订阅', isNowSub ? 'success' : 'info');
}

// ==================== 过滤 & 排序（主页：已订阅工具） ====================
function applyFilters() {
  const subscribedIds = loadSubscribedIds();
  let list = AppState.tools.filter(t => subscribedIds.includes(t.id));

  // 搜索
  const q = AppState.searchQuery.toLowerCase().trim();
  if (q) {
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(q)) ||
      t.category.toLowerCase().includes(q)
    );
  }

  // 排序：使用次数优先
  const usageData = getAllUsageData();
  list.sort((a, b) => {
    const diff = (usageData[b.id] || 0) - (usageData[a.id] || 0);
    return diff !== 0 ? diff : a.name.localeCompare(b.name, 'zh');
  });

  AppState.filtered = list;
  renderMyTools(list);
}

// ==================== 渲染统计 ====================
function renderStats() {
  const total = AppState.tools.length;
  const cats = new Set(AppState.tools.map(t => t.category)).size;
  const stableCount = AppState.tools.filter(t => t.status === 'stable').length;
  const subscribedCount = loadSubscribedIds().length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-stable').textContent = stableCount;
  document.getElementById('stat-cats').textContent = cats;
  document.getElementById('stat-subscribed').textContent = subscribedCount;
}

// ==================== 渲染工具卡片 ====================


function renderToolCard(tool) {
  const statusMap = { stable: '稳定', beta: '测试', dev: '开发中', deprecated: '已废弃' };
  const statusLabel = statusMap[tool.status] || tool.status;

  const tagsHtml = (tool.tags || []).slice(0, 3).map(tag =>
    `<span class="tool-tag">${tag}</span>`
  ).join('');

  const aiBadge = tool.ai_callable
    ? `<span class="tool-ai-badge">🤖 AI可调用</span>`
    : '';

  // 使用次数徽标
  const usageCount = getToolUsage(tool.id);
  const usageBadge = usageCount > 0
    ? `<span class="tool-usage-badge" title="已使用 ${usageCount} 次">🔥 ${usageCount}</span>`
    : '';

  // 点击卡片打开工具，操作指引改为小按钮
  return `
    <div class="tool-card" onclick="openTool('${tool.id}')" style="cursor:pointer">
      <div class="tool-card-header">
        <div class="tool-icon">${tool.icon || '🔧'}</div>
        <div style="flex:1">
          <div class="tool-name">${tool.name}</div>
          <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
            <span class="tool-status ${tool.status}">${statusLabel}</span>
            ${aiBadge}
            ${usageBadge}
          </div>
        </div>
      </div>
      <div class="tool-description">${tool.description}</div>
      ${tagsHtml ? `<div class="tool-tags">${tagsHtml}</div>` : ''}
      <div class="tool-card-footer">
        <span style="display:flex;align-items:center;gap:4px">
          <span class="category-dot" style="background:${getCategoryColor(tool.category)}"></span>
          ${tool.category}
        </span>
        <div class="tool-card-actions" onclick="event.stopPropagation()">
          <a class="btn-tool btn-tool-ghost" onclick="openToolDoc('${tool.id}')" title="查看使用帮助">❓</a>
          ${tool.url ? `<a class="btn-tool btn-tool-primary" href="${tool.url}" onclick="incrementToolUsage('${tool.id}')">打开工具 →</a>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ==================== 打开工具 ====================
function openTool(toolId) {
  const tool = AppState.tools.find(t => t.id === toolId);
  if (tool && tool.url) {
    // 记录使用次数
    incrementToolUsage(toolId);
    // 打开工具页面
    window.location.href = tool.url;
    return;
  }
  // 如果没有 URL，则打开操作指引
  openToolDoc(toolId);
}

async function openToolDoc(toolId) {
  const tool = AppState.tools.find(t => t.id === toolId);
  if (!tool) return;

  AppState.currentTool = tool;

  // 填充头部
  document.getElementById('modal-icon').textContent = tool.icon || '🔧';
  document.getElementById('modal-title').textContent = tool.name;
  document.getElementById('modal-subtitle').textContent = `${tool.category} · v${tool.version} · ${tool.status}`;

  // 默认显示文档 tab
  showModalTab('doc');

  // 显示模态框
  document.getElementById('modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';

  // 加载文档
  await loadToolDoc(tool);
}

async function loadToolDoc(tool) {
  const docEl = document.getElementById('modal-doc');
  docEl.innerHTML = '<div class="skeleton" style="height:20px;margin-bottom:12px"></div><div class="skeleton" style="height:20px;width:70%;margin-bottom:12px"></div><div class="skeleton" style="height:80px"></div>';

  try {
    const resp = await fetch(tool.doc + '?t=' + Date.now());
    if (!resp.ok) throw new Error('文档不存在');
    const md = await resp.text();
    docEl.innerHTML = `<div class="markdown-body">${parseMarkdown(md)}</div>`;
  } catch (e) {
    // 检查是否是 file:// 协议导致的跨域问题
    const isFileProtocol = window.location.protocol === 'file:';
    const helpMsg = isFileProtocol 
      ? `<p style="color:#f97316;margin-top:16px">⚠️ 检测到你使用本地文件方式打开页面</p>
         <p>请使用 HTTP 服务器方式访问：<code>http://localhost:8080</code></p>
         <p style="font-size:12px;margin-top:8px">启动服务器命令：<code>python -m http.server 8080</code></p>`
      : `<p>文档路径：<code>${tool.doc}</code></p>
         <p style="font-size:12px;margin-top:8px">请检查服务器是否正常运行</p>`;
    
    docEl.innerHTML = `
      <div class="markdown-body">
        <div style="text-align:center;padding:40px 0;color:var(--text-muted)">
          <div style="font-size:36px;margin-bottom:12px">📄</div>
          <p>无法加载操作指引文档</p>
          ${helpMsg}
        </div>
      </div>
    `;
  }
}

function showModalTab(tab) {
  document.querySelectorAll('.modal-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.modal-pane').forEach(el => el.style.display = 'none');
  document.querySelector(`.modal-tab[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`pane-${tab}`).style.display = 'block';

  // 渲染工具信息 tab
  if (tab === 'info' && AppState.currentTool) {
    renderToolInfo(AppState.currentTool);
  }
}

function renderToolInfo(tool) {
  const el = document.getElementById('pane-info');
  const usageCount = getToolUsage(tool.id);
  el.innerHTML = `
    <div class="markdown-body">
      <table>
        <tr><th>字段</th><th>内容</th></tr>
        <tr><td>工具名称</td><td><strong>${tool.name}</strong></td></tr>
        <tr><td>唯一标识</td><td><code>${tool.id}</code></td></tr>
        <tr><td>分类</td><td>${tool.category}</td></tr>
        <tr><td>当前版本</td><td>${tool.version}</td></tr>
        <tr><td>状态</td><td>${tool.status}</td></tr>
        <tr><td>使用次数</td><td>${usageCount > 0 ? `🔥 ${usageCount} 次` : '尚未使用'}</td></tr>
        <tr><td>创建时间</td><td>${tool.created}</td></tr>
        <tr><td>更新时间</td><td>${tool.updated}</td></tr>
        <tr><td>AI 可调用</td><td>${tool.ai_callable ? '✅ 是' : '❌ 否'}</td></tr>
        ${tool.ai_callable ? `<tr><td>AI 描述</td><td>${tool.ai_description}</td></tr>` : ''}
        <tr><td>工具入口</td><td>${tool.url ? `<a href="${tool.url}" target="_blank">${tool.url}</a>` : '暂无'}</td></tr>
        <tr><td>标签</td><td>${(tool.tags || []).map(t => `<code>${t}</code>`).join(' ')}</td></tr>
      </table>
    </div>
  `;
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
  AppState.currentTool = null;
}

// ==================== 极简 Markdown 解析器 ====================
function parseMarkdown(md) {
  // 转义 HTML
  const escape = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  let html = md;

  // 代码块
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="language-${lang}">${escape(code.trim())}</code></pre>`
  );

  // 行内代码
  html = html.replace(/`([^`]+)`/g, (_, c) => `<code>${escape(c)}</code>`);

  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 粗体 & 斜体
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // 分割线
  html = html.replace(/^---+$/gm, '<hr>');

  // 引用块
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // 无序列表
  html = html.replace(/((?:^[*\-+] .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(line =>
      `<li>${line.replace(/^[*\-+] /, '')}</li>`
    ).join('');
    return `<ul>${items}</ul>`;
  });

  // 有序列表
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(line =>
      `<li>${line.replace(/^\d+\. /, '')}</li>`
    ).join('');
    return `<ol>${items}</ol>`;
  });

  // 段落 (将剩余的行包裹为 p)
  html = html.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (/^<[h1-6|ul|ol|pre|blockquote|hr]/.test(block)) return block;
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  return html;
}

// ==================== AI 工具选择面板 ====================
function openAIPanel() {
  document.getElementById('ai-modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAIPanel() {
  document.getElementById('ai-modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('ai-result').classList.remove('visible');
  document.getElementById('ai-input').value = '';
}

function aiSelectTool() {
  const query = document.getElementById('ai-input').value.trim();
  if (!query) {
    showToast('请输入你的需求描述', 'info');
    return;
  }

  const resultEl = document.getElementById('ai-result');
  resultEl.classList.add('visible');
  resultEl.innerHTML = '🤖 分析中...';

  // 本地匹配逻辑（后续可替换为实际 AI 接口调用）
  setTimeout(() => {
    const matched = matchToolByQuery(query);
    if (matched.length === 0) {
      resultEl.innerHTML = `
        <div style="color:var(--text-muted)">
          <strong style="color:var(--text-primary)">未找到匹配工具</strong><br>
          当前工具库中没有能处理 "${query}" 的工具，建议先制作相关工具。
        </div>
      `;
    } else {
      resultEl.innerHTML = `
        <div>
          <div style="color:var(--text-muted);margin-bottom:12px;font-size:12px">🤖 根据你的需求，推荐以下工具：</div>
          ${matched.map(t => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg-secondary);border-radius:8px;margin-bottom:8px;cursor:pointer"
                 onclick="closeAIPanel();openToolDoc('${t.id}')">
              <span style="font-size:20px">${t.icon}</span>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${t.name}</div>
                <div style="font-size:12px;color:var(--text-muted)">${t.description}</div>
              </div>
              <span style="font-size:12px;color:var(--accent-light)">→</span>
            </div>
          `).join('')}
        </div>
      `;
    }
  }, 800);
}

function matchToolByQuery(query) {
  const q = query.toLowerCase();
  return AppState.tools.filter(t => {
    const text = `${t.name} ${t.description} ${(t.tags||[]).join(' ')} ${t.ai_description}`.toLowerCase();
    return q.split(/\s+/).some(word => text.includes(word));
  }).slice(0, 3);
}

// ==================== 视图切换 ====================
function setViewMode(mode) {
  AppState.viewMode = mode;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.view-btn[data-mode="${mode}"]`).classList.add('active');
  // 更新当前网格样式
  const grid = document.getElementById('tools-grid');
  grid.className = `tools-grid ${mode === 'list' ? 'list-view' : ''}`;
}

// ==================== Toast 通知 ====================
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} visible`;
  setTimeout(() => { toast.classList.remove('visible'); }, 2800);
}

// ==================== 复制 API 清单地址 ====================
function copyManifestUrl() {
  const url = window.location.origin + window.location.pathname.replace('index.html', '') + 'api/tools-manifest.json';
  navigator.clipboard?.writeText(url).then(() => showToast('AI 清单地址已复制', 'success'));
}

// ==================== 键盘事件 ====================
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeAIPanel();
  }
  // Ctrl+K 快捷搜索
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('search-input').focus();
    document.getElementById('search-input').select();
  }
});

// 点击遮罩关闭
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.getElementById('ai-modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('ai-modal-overlay')) closeAIPanel();
});

// AI 输入框回车触发
document.getElementById('ai-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') aiSelectTool();
});

// 搜索框（主页）
document.getElementById('search-input').addEventListener('input', e => {
  AppState.searchQuery = e.target.value;
  applyFilters();
});

// 商城搜索框
document.getElementById('store-search').addEventListener('input', e => {
  renderStorePage();
});

// ==================== 初始化 ====================
loadTools();
