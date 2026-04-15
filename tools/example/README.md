# 示例工具

> 这是一个示例工具，展示工具集的基本结构和使用方式。

## 功能介绍

本示例工具展示了工具集的基本架构，包括：

- 工具页面的基本布局
- 与主导航站的关联方式
- README 文档的标准格式

## 快速开始

1. 打开工具主页
2. 熟悉界面布局
3. 按照提示操作

## 操作说明

### 步骤一：了解工具集结构

每个工具都应放置在 `tools/<工具ID>/` 目录下，包含：

```
tools/
└── my-tool/
    ├── index.html    # 工具主界面
    └── README.md     # 操作指引（本文件）
```

### 步骤二：添加新工具

在 `tools.json` 中添加一条记录：

```json
{
  "id": "my-tool",
  "name": "工具名称",
  "description": "一句话描述这个工具做什么",
  "category": "分类名",
  "tags": ["标签1", "标签2"],
  "version": "1.0.0",
  "status": "stable",
  "url": "./tools/my-tool/index.html",
  "doc": "./tools/my-tool/README.md",
  "icon": "🔧",
  "created": "2026-03-17",
  "updated": "2026-03-17",
  "ai_callable": false,
  "ai_description": "",
  "ai_params": {}
}
```

### 步骤三：启用 AI 调用（可选）

如果你的工具支持 AI 自主调用，将 `ai_callable` 设置为 `true` 并填写：

```json
{
  "ai_callable": true,
  "ai_description": "当用户需要做 X 任务时使用此工具，支持 Y 和 Z 功能",
  "ai_params": {
    "input": "用户输入内容",
    "mode": "处理模式：fast | accurate"
  }
}
```

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 工具唯一标识，小写加连字符 |
| name | string | 工具显示名称 |
| description | string | 简短描述，建议 30 字以内 |
| category | string | 工具分类 |
| tags | array | 搜索标签，建议 3-5 个 |
| version | string | 版本号，格式 `主.次.补丁` |
| status | string | `stable` / `beta` / `dev` / `deprecated` |
| url | string | 工具入口页面路径 |
| doc | string | README.md 路径 |
| icon | string | 工具图标 emoji |
| ai_callable | boolean | 是否支持 AI 自主调用 |
| ai_description | string | AI 理解工具用途的描述 |
| ai_params | object | AI 调用时的参数说明 |

## 注意事项

> 每次添加或更新工具后，记得同步更新 `tools.json` 中的 `updated` 字段

---

如有问题，参考工具集导航站的完整文档。
