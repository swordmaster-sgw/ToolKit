#!/usr/bin/env node
/**
 * 批量为所有工具页面注入主题切换功能 v2
 * 用法：node scripts/add-theme-to-tools.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const TOOLS_DIR = path.join(__dirname, '..', 'tools');
const isDryRun = process.argv.includes('--dry-run');

function collectHtmlFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(full);
    } else if (entry.isDirectory() && entry.name !== 'example') {
      const idx = path.join(full, 'index.html');
      if (fs.existsSync(idx)) files.push(idx);
    }
  }
  return files;
}

function getRelPath(htmlPath, target) {
  const rel = path.relative(path.dirname(htmlPath), target);
  return rel.replace(/\\/g, '/');
}

const ANTI_FLASH = `
  <script>
    (function(){var t=localStorage.getItem('devkit-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();
  </script>`;

function processFile(filePath) {
  const relPath = path.relative(TOOLS_DIR, filePath);
  let html = fs.readFileSync(filePath, 'utf-8');
  const original = html;

  // 跳过已处理的文件
  if (html.includes('id="theme-container"')) {
    return { file: relPath, status: 'skipped', reason: 'already has theme-container' };
  }
  if (filePath.includes('example')) {
    return { file: relPath, status: 'skipped', reason: 'example folder' };
  }

  const themeJsPath = getRelPath(filePath, path.join(__dirname, '..', 'assets', 'js', 'theme.js'));
  const styleCssPath = getRelPath(filePath, path.join(__dirname, '..', 'assets', 'css', 'style.css'));

  // === 步骤 1：防闪烁脚本 ===
  if (!html.includes('devkit-theme')) {
    if (html.match(/<title>.*?<\/title>/s)) {
      html = html.replace(/(<title>[\s\S]*?<\/title>)/, `$1${ANTI_FLASH}`);
    } else if (html.match(/<head[^>]*>/)) {
      html = html.replace(/(<head[^>]*>)/, `$1${ANTI_FLASH}`);
    }
  }

  // === 步骤 2：在 </head> 前注入 style.css + theme.js ===
  if (!html.includes('theme.js')) {
    const headInject = `\n  <link rel="stylesheet" href="${styleCssPath}">\n  <script src="${themeJsPath}"></script>`;
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${headInject}\n</head>`);
    }
  }

  // === 步骤 3：注入 theme-container div ===
  const themeDiv = '<div id="theme-container"></div>\n';
  let injected = false;

  // 策略 A：在 <a class="...back-btn..."> 标签前面插入
  // back-btn 通常在 header 的最右侧，在其前面放 theme-container
  const backBtnMatch = html.match(/(<a\s[^>]*class="[^"]*back-btn[^"]*"[^>]*>)/);
  if (backBtnMatch) {
    html = html.replace(backBtnMatch[0], `${themeDiv}  ${backBtnMatch[0]}`);
    injected = true;
  }

  // 策略 B：有 <header> 标签的页面
  if (!injected && /<header[\s>]/.test(html) && /<\/header>/.test(html)) {
    html = html.replace(/(<\/header>)/, `$1\n${themeDiv}`);
    injected = true;
  }

  // 策略 C：有 .header div 的页面（在 </div> 关闭 .header 后）
  if (!injected) {
    // 找到 body 之后的第一个 <div class="header"> 或 <div class="header ...">
    // 然后在对应的 </div> 后插入
    const headerDivMatch = html.match(/(<body[\s\S]*?<div\s+class="header"[^>]*>[\s\S]*?<\/div>\s*)(<\/div>\s*\n)/);
    if (headerDivMatch) {
      html = html.replace(headerDivMatch[0], headerDivMatch[1] + themeDiv + headerDivMatch[2]);
      injected = true;
    }
  }

  // 策略 D：兜底 - 在 <body> 后的第一个标签后插入
  if (!injected) {
    html = html.replace(/(<body[^>]*>\s*\n?)/, `$1${themeDiv}`);
    injected = true;
  }

  // === 步骤 4：注入 ThemeManager.init() ===
  if (!html.includes('ThemeManager.init')) {
    // 找 body 中的第一个 <script> 标签（非 head 中的）
    const bodyStart = html.indexOf('<body');
    if (bodyStart > -1) {
      const firstScriptInBody = html.indexOf('<script>', bodyStart);
      if (firstScriptInBody > -1) {
        const pos = firstScriptInBody + '<script>'.length;
        html = html.slice(0, pos) + "\nThemeManager.init('theme-container');" + html.slice(pos);
      } else {
        // 没有 <script> 标签，在 </body> 前添加
        html = html.replace('</body>', '<script>ThemeManager.init("theme-container");</script>\n</body>');
      }
    }
  }

  if (html !== original) {
    if (!isDryRun) {
      fs.writeFileSync(filePath, html, 'utf-8');
    }
    return { file: relPath, status: 'modified' };
  }
  return { file: relPath, status: 'skipped', reason: 'no changes needed' };
}

// 需要先恢复已经修改过的文件（还原 theme-container 缺失的问题）
// 先执行一次还原，再重新注入

// 主流程
const files = collectHtmlFiles(TOOLS_DIR);
console.log(`\n  找到 ${files.length} 个工具页面\n`);

let modified = 0, skipped = 0, errors = 0;
for (const f of files) {
  try {
    const result = processFile(f);
    if (result.status === 'modified') {
      modified++;
      console.log(`  [OK] ${result.file}`);
    } else {
      skipped++;
      console.log(`  [--] ${result.file} (${result.reason})`);
    }
  } catch (e) {
    errors++;
    console.error(`  [ERR] ${path.relative(TOOLS_DIR, f)}: ${e.message}`);
  }
}

console.log(`\n${'='.repeat(40)}`);
console.log(`  Modified: ${modified}  |  Skipped: ${skipped}  |  Errors: ${errors}`);
if (isDryRun) console.log(`  ** DRY RUN - no files changed **`);
console.log();
