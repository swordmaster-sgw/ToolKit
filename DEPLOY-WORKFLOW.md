# 🚀 ToolKit 发布流程说明

> 项目托管于 GitHub (`swordmaster-sgw/ToolKit`)，自动部署到 Cloudflare Pages。
> **每次 push 到 `main` 分支后，Cloudflare Pages 会自动触发部署，通常 1~2 分钟上线。**

---

## 架构概览

```
本地修改
  ↓ git add / commit / push
GitHub (swordmaster-sgw/ToolKit)
  ↓ 自动触发（Webhook）
Cloudflare Pages
  ↓ 静态资源部署
线上访问
```

---

## 日常更新流程（一键脚本）

```bash
cd /Users/sgw/Desktop/tools/ToolKit

# 方式一：交互式，脚本引导填写 commit message
./publish.sh

# 方式二：直接指定 commit message
./publish.sh "feat: 新增 xxx 工具"

# 方式三：只提交当前改动文件（不加 -A）
./publish.sh "fix: 修复 json-formatter 折叠 bug" --no-all
```

---

## 手动步骤（等价于脚本）

```bash
cd /Users/sgw/Desktop/tools/ToolKit

# 1. 检查改了哪些文件
git status

# 2. （可选）更新 sitemap
node scripts/generate-sitemap.js > sitemap.xml

# 3. 暂存 & 提交
git add -A
git commit -m "你的 commit 信息"

# 4. 推送到 GitHub，触发 Cloudflare 自动部署
git push origin main

# 5. 查看部署状态（约 1~2 分钟）
# 访问：https://dash.cloudflare.com → Workers & Pages → ToolKit
```

---

## Commit Message 规范

| 前缀 | 适用场景 |
|------|----------|
| `feat:` | 新增功能、新工具 |
| `fix:` | Bug 修复 |
| `style:` | UI 调整、样式变更 |
| `refactor:` | 代码重构（功能不变） |
| `docs:` | 文档更新 |
| `chore:` | 配置、脚本、依赖更新 |

示例：
```
feat(json-formatter): add cURL/DDL code generators
fix: copy output now uses formatted text instead of DOM textContent
style: update sidebar hover animation
```

---

## 选择性提交（只提交部分文件）

当工作区有多个未完成的改动，只想上线其中一部分时：

```bash
# 只提交指定文件
git add tools/json-formatter/index.html tools.json
git commit -m "feat: 更新 json-formatter"
git push origin main
```

---

## 验证部署

1. 打开 [Cloudflare Pages Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. 找到 `ToolKit` 项目，查看最新 deployment 状态
3. 状态变为 ✅ **Active** 后即可访问线上页面

---

## 回滚

若上线后发现问题，可以快速回滚：

```bash
# 方式一：回退到上一个 commit（保留工作区）
git revert HEAD
git push origin main

# 方式二：在 Cloudflare Pages Dashboard 手动激活历史部署
# Workers & Pages → ToolKit → Deployments → 选择历史版本 → Rollback
```

---

## 相关配置文件

| 文件 | 用途 |
|------|------|
| `_headers` | Cloudflare 缓存策略、安全响应头 |
| `_redirects` | URL 重写/跳转规则 |
| `robots.txt` | 搜索引擎爬虫配置 |
| `sitemap.xml` | 站点地图（SEO） |
| `scripts/generate-sitemap.js` | 自动生成 sitemap 脚本 |

---

> 脚本路径：`./publish.sh`  
> 如遇 SSH 连接问题：`ssh -T git@github.com` 验证密钥是否正常
