# 🚀 ToolKit 发布流程说明

> 项目托管于 GitHub (`swordmaster-sgw/ToolKit`)，通过 **Wrangler CLI** 手动部署到 Cloudflare Pages。
> **线上地址**：`https://toolkit-3ur.pages.dev`

---

## 架构概览

```
本地修改
  ↓ ./publish.sh 或手动执行
  ├─ git add / commit / push（保存到 GitHub）
  └─ npx wrangler pages deploy（直接上传到 Cloudflare）
      ↓
Cloudflare Pages (toolkit)
  ↓ 部署完成，即时生效
线上访问 https://toolkit-3ur.pages.dev
```

> ⚠️ **注意**：本项目 Cloudflare Pages **未连接 GitHub 自动部署**（Git Provider: No），
> `git push` 不会触发线上更新，必须通过 wrangler CLI 部署。

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

# 4. 推送到 GitHub（代码备份）
git push origin main

# 5. 部署到 Cloudflare Pages（这一步才是上线的！）
npx wrangler pages deploy . --project-name=toolkit --branch=main --commit-dirty=true

# 部署成功后会输出线上 URL，通常即时生效
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

1. 部署成功后 wrangler 会输出部署 URL
2. 访问 https://toolkit-3ur.pages.dev 确认页面更新
3. 也可在 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → `toolkit` 查看

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
