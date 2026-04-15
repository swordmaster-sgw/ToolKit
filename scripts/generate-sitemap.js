/**
 * 生成 sitemap.xml
 * 用法：node scripts/generate-sitemap.js > public/sitemap.xml
 */
const fs = require('fs');
const path = require('path');
const tools = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tools.json'), 'utf8'));

const BASE_URL = 'https://devkit.pages.dev'; // 替换为你的实际域名
const today = new Date().toISOString().split('T')[0];

const pages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/index.html#store', priority: '0.8', changefreq: 'weekly' },
];

// 为每个工具添加独立页面
tools.forEach(tool => {
  const toolUrl = tool.url.startsWith('./') ? tool.url.substring(2) : tool.url;
  pages.push({
    url: '/' + toolUrl,
    priority: '0.7',
    changefreq: 'monthly',
  });
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

console.log(xml);
