/**
 * WorkBuddy API Server
 * 开发者工具服务 API
 * 
 * 使用: node server.js
 * 端口: 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 导入工具函数库
const toolFunctions = require('./tools-lib');

const PORT = 3000;

// 加载工具配置
function loadToolsConfig() {
  try {
    const data = fs.readFileSync(path.join(__dirname, '..', 'tools.json'), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading tools.json:', e.message);
    return [];
  }
}

// 加载 AI 配置
function loadAIConfig() {
  try {
    const data = fs.readFileSync(path.join(__dirname, '..', 'tools-ai-config.json'), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { tools: [] };
  }
}

// 路由处理
function handleRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // API: 获取所有工具
  if (pathname === '/api/tools') {
    const tools = loadToolsConfig();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tools));
    return;
  }
  
  // API: 获取 AI 可调用工具
  if (pathname === '/api/tools/ai') {
    const aiConfig = loadAIConfig();
    const tools = loadToolsConfig();
    
    const oaiTools = aiConfig.tools.map(cfg => {
      const tool = tools.find(t => t.id === cfg.id) || {};
      return {
        type: 'function',
        function: {
          name: cfg.id,
          description: cfg.ai_description || tool.description,
          parameters: {
            type: 'object',
            properties: cfg.ai_params,
            required: Object.entries(cfg.ai_params).filter(([_, v]) => v.required).map(([k]) => k)
          }
        }
      };
    });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(oaiTools));
    return;
  }
  
  // API: 执行工具
  const execMatch = pathname.match(/^\/api\/exec\/(.+)$/);
  if (execMatch && req.method === 'POST') {
    const toolId = execMatch[1];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const params = JSON.parse(body);
        const toolFunc = toolFunctions[toolId];
        
        if (!toolFunc) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Tool not found: ' + toolId }));
          return;
        }
        
        const result = toolFunc.exec(params);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }
  
  // API: 获取单个工具
  const toolMatch = pathname.match(/^\/api\/tools\/(.+)$/);
  if (toolMatch) {
    const toolId = toolMatch[1];
    const tools = loadToolsConfig();
    const tool = tools.find(t => t.id === toolId);
    
    if (tool) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tool));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Tool not found' }));
    }
    return;
  }

  // 静态文件服务（根目录为项目根，非 api/ 子目录）
  const ROOT_DIR = path.join(__dirname, '..');
  let filePath = pathname === '/' ? '/index.html' : pathname;
  // /api-docs 指向 api/index.html（API 说明页）
  if (pathname === '/api-docs') filePath = '/api/index.html';
  filePath = path.join(ROOT_DIR, filePath);
  
  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.md': 'text/markdown'
  };
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(data);
  });
}

// 启动服务器
const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   ⚡ My Toolkit - 个人工具集                              ║
║                                                          ║
║   🏠 主页:     http://localhost:${PORT}                    ║
║   📋 API文档:  http://localhost:${PORT}/api-docs           ║
║   🔧 工具列表: http://localhost:${PORT}/api/tools          ║
║   🤖 AI调用:   http://localhost:${PORT}/api/tools/ai       ║
║                                                          ║
║   按 Ctrl+C 停止服务                                      ║
╚══════════════════════════════════════════════════════════╝
  `);
});
