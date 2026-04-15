# 🚀 ToolKit 部署指南

## 前置条件
- GitHub 账号
- Cloudflare 账号（免费版即可）

## 第一步：创建 GitHub 仓库

1. 打开 https://github.com/new
2. 填写信息：
   - **Repository name**: `devkit`（或你喜欢的名字）
   - **Description**: `⚡ 50+ 开发者在线工具集 - JSON格式化、数据脱敏、正则测试、文本处理等`
   - **Visibility**: ✅ Public（公开，SEO 引流必须）
   - **不要**勾选 Add README / .gitignore / License（已有）
3. 点击 **Create repository**

## 第二步：推送代码到 GitHub

在终端执行（将 `YOUR_USERNAME` 替换为你的 GitHub 用户名）：

```bash
cd /Users/sgw/Desktop/tools/ToolKit
git remote add origin https://github.com/YOUR_USERNAME/devkit.git
git push -u origin main
```

## 第三步：配置 Cloudflare Pages

### 方式 A：通过 GitHub 自动部署（推荐）

1. 登录 https://dash.cloudflare.com/
2. 左侧菜单 → **Workers & Pages** → **Create**
3. 选择 **Pages** → **Connect to Git**
4. 授权 GitHub 并选择 `devkit` 仓库
5. 构建配置：
   - **Framework preset**: `None`
   - **Build command**: 留空
   - **Build output directory**: `/`
6. 点击 **Save and Deploy**

### 方式 B：直接上传（更快）

1. 登录 https://dash.cloudflare.com/
2. 左侧菜单 → **Workers & Pages** → **Create**
3. 选择 **Pages** → **Upload assets**
4. 将整个项目目录打包上传：
   ```bash
   cd /Users/sgw/Desktop/tools
   tar -czf toolkit-deploy.tar.gz \
     --exclude='ToolKit/node_modules' \
     --exclude='ToolKit/.git' \
     --exclude='ToolKit/dist-electron' \
     --exclude='ToolKit/.workbuddy' \
     --exclude='ToolKit/needs' \
     ToolKit/
   ```
5. 上传 `toolkit-deploy.tar.gz`
6. **注意**：`public/` 目录下的 `_redirects`、`_headers`、`robots.txt`、`sitemap.xml` 需要放到**根目录**才能生效。Cloudflare Pages 要求这些文件在输出目录的根级。

### ✅ 部署文件已就位

`_redirects`、`_headers`、`robots.txt`、`sitemap.xml` 已复制到项目根目录，Cloudflare Pages 可直接识别。源文件保留在 `public/` 目录。

## 第四步：验证部署

部署成功后，Cloudflare 会给你一个 `xxx.pages.dev` 的域名。

验证清单：
- [ ] 首页正常加载：`https://xxx.pages.dev/`
- [ ] 工具商城正常：`https://xxx.pages.dev/index.html#store`
- [ ] 工具页面正常：`https://xxx.pages.dev/tools/json-formatter/index.html`
- [ ] 数据脱敏正常：`https://xxx.pages.dev/tools/data-masking/index.html`
- [ ] SEO 配置生效：`https://xxx.pages.dev/robots.txt`
- [ ] Sitemap 可访问：`https://xxx.pages.dev/sitemap.xml`

## 第五步：自定义域名（可选）

1. Cloudflare Pages → 你的项目 → **Custom domains**
2. 输入你的域名（如 `devkit.cn`）
3. 按提示添加 DNS 记录
4. 等待 SSL 自动配置（通常几分钟）

## 更新部署

每次修改代码后：

```bash
cd /Users/sgw/Desktop/tools/ToolKit
# 更新 sitemap
node scripts/generate-sitemap.js > sitemap.xml
git add -A
git commit -m "update: 工具更新"
git push
```

如果使用 GitHub 自动部署，push 后 1-2 分钟自动上线。

## 后续优化

- [ ] Google Search Console 提交 sitemap
- [ ] 百度站长平台提交
- [ ] 添加 GA4 / 百度统计代码
- [ ] GitHub README 优化（加截图、Badge）
- [ ] 开源协议确认（当前 MIT）
