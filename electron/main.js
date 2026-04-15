/**
 * WorkBuddy Electron 主进程
 * 内嵌 HTTP 服务器 + 原生窗口
 */

const { app, BrowserWindow, shell, Menu, Tray, nativeImage, dialog } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const url = require('url');

// ── 内嵌的工具函数库（从 api/ 目录加载）──
let toolFunctions = {};
let server = null;
let mainWindow = null;
let tray = null;
const PORT = 3799; // 使用不常见端口，避免冲突

// ── 资源根目录（兼容 asar 打包）──
function getRootDir() {
  // 打包后 app.getAppPath() 指向 asar 内部
  return app.getAppPath();
}

// ── 加载工具配置 ──
function loadToolsConfig() {
  try {
    const data = fs.readFileSync(path.join(getRootDir(), 'tools.json'), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function loadAIConfig() {
  try {
    const data = fs.readFileSync(path.join(getRootDir(), 'tools-ai-config.json'), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { tools: [] };
  }
}

// ── 静态文件 MIME ──
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
  '.md':   'text/markdown; charset=utf-8',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

// ── 启动内嵌 HTTP 服务器 ──
function startServer() {
  // 动态加载工具库
  try {
    toolFunctions = require(path.join(getRootDir(), 'api', 'tools-lib.js'));
  } catch(e) {
    console.error('tools-lib 加载失败:', e.message);
  }

  server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // API: 工具列表
    if (pathname === '/api/tools') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(loadToolsConfig()));
      return;
    }

    // API: AI 可调用工具
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
              required: Object.entries(cfg.ai_params || {}).filter(([,v]) => v.required).map(([k]) => k)
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
          const params = JSON.parse(body || '{}');
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

    // API: 单个工具
    const toolMatch = pathname.match(/^\/api\/tools\/([^/]+)$/);
    if (toolMatch) {
      const tool = loadToolsConfig().find(t => t.id === toolMatch[1]);
      if (tool) { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(tool)); }
      else { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Not found' })); }
      return;
    }

    // 静态文件
    const ROOT_DIR = getRootDir();
    let filePath = pathname === '/' ? '/index.html' : pathname;
    if (pathname === '/api-docs') filePath = '/api/index.html';
    filePath = path.join(ROOT_DIR, filePath);

    // 安全校验：防止路径穿越
    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not Found'); return; }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[WorkBuddy] 内嵌服务器启动于 http://127.0.0.1:${PORT}`);
      resolve();
    });
    server.on('error', (e) => {
      // 端口占用时尝试随机端口
      if (e.code === 'EADDRINUSE') {
        server.listen(0, '127.0.0.1', () => {
          const actualPort = server.address().port;
          console.log(`[WorkBuddy] 端口 ${PORT} 被占用，改用 ${actualPort}`);
          resolve(actualPort);
        });
      } else reject(e);
    });
  });
}

// ── 创建主窗口 ──
function createWindow() {
  const actualPort = server.address().port;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'WorkBuddy 开发者工具集',
    icon: path.join(getRootDir(), 'electron', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#0f1117',
    show: false, // 等加载完成再显示
  });

  mainWindow.loadURL(`http://127.0.0.1:${actualPort}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 外部链接在系统浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // 设置菜单
  buildMenu(actualPort);
}

// ── 应用菜单 ──
function buildMenu(port) {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ label: app.name, submenu: [
      { role: 'about' }, { type: 'separator' },
      { role: 'services' }, { type: 'separator' },
      { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
      { type: 'separator' }, { role: 'quit' }
    ]}] : []),
    { label: '文件', submenu: [isMac ? { role: 'close' } : { role: 'quit', label: '退出' }] },
    { label: '视图', submenu: [
      { role: 'reload', label: '刷新' },
      { role: 'forceReload', label: '强制刷新' },
      { type: 'separator' },
      { role: 'resetZoom', label: '重置缩放' },
      { role: 'zoomIn', label: '放大' },
      { role: 'zoomOut', label: '缩小' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: '全屏' },
    ]},
    { label: '工具', submenu: [
      {
        label: '在浏览器中打开',
        click: () => shell.openExternal(`http://127.0.0.1:${port}`)
      },
      { type: 'separator' },
      {
        label: '开发者工具',
        accelerator: 'F12',
        click: () => mainWindow && mainWindow.webContents.toggleDevTools()
      }
    ]},
    { label: '帮助', submenu: [
      { label: `API 服务端口: ${port}`, enabled: false },
      { type: 'separator' },
      { label: '关于 WorkBuddy', click: () => {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: '关于 WorkBuddy',
          message: 'WorkBuddy 开发者工具集',
          detail: `版本: 1.0.0\n内嵌 API 端口: ${port}\n\n包含 40+ 个开发者常用工具`,
          buttons: ['确定'],
          icon: path.join(getRootDir(), 'electron', 'icon.png'),
        });
      }}
    ]},
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── 系统托盘（仅 Windows）──
function createTray(port) {
  if (process.platform === 'darwin') return; // macOS 有 Dock，不需要托盘
  try {
    const iconPath = path.join(getRootDir(), 'electron', 'icon.png');
    const img = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    tray = new Tray(img);
    tray.setToolTip('WorkBuddy 开发者工具集');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: '显示主窗口', click: () => { if (mainWindow) mainWindow.show(); else createWindow(); } },
      { label: `在浏览器中打开 (端口 ${port})`, click: () => shell.openExternal(`http://127.0.0.1:${port}`) },
      { type: 'separator' },
      { label: '退出', click: () => { app.quit(); } }
    ]));
    tray.on('double-click', () => { if (mainWindow) mainWindow.show(); else createWindow(); });
  } catch(e) { /* 无图标时跳过托盘 */ }
}

// ── 应用生命周期 ──
app.whenReady().then(async () => {
  await startServer();
  const port = server.address().port;
  createWindow();
  createTray(port);

  app.on('activate', () => {
    // macOS：点击 Dock 图标重新打开窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // macOS 保持运行（托盘/Dock），其他平台退出
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (server) server.close();
});
