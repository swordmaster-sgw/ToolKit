/**
 * DevKit - 开发者工具集
 * 公开展示所有点开即用的工具
 */

// 依赖用户数据、无法公开展示的工具 ID
const HIDDEN_IDS = new Set([
  'clipboard-manager',   // 剪贴板工作台 — 本地历史数据
  'code-snippets',       // 代码片段极速插入 — 本地收藏数据
  'code-snippet',        // 代码片段管理器 — 本地收藏数据
  'quick-notes',         // 快速便签 — 本地便签数据
  'task-board',          // 个人任务看板 — 本地任务数据
  'simple-accounting',   // 个人记账 — 本地财务数据
  'health-reminder',     // 久坐健康提醒 — Electron 专属
  'mock-assistant',      // 接口Mock小助手 — 本地 Mock 数据
  'wechat-quick',        // 微信/钉钉快速助手 — Electron 专属
  'cli-toolkit',         // 命令行工具箱 — 本地命令数据
  'code-snippets-pro',   // 代码片段增强版 — 本地团队数据
  'architecture-sketch', // 架构设计草稿本 — 本地草稿数据
  'image-toolbox',       // 图片工具箱增强版 — Electron 专属
  'adr-notebook',        // 架构决策记录本 — 本地决策数据
  'dev-analytics',       // 个人开发数据分析 — 本地编码数据
  'tech-debt-dashboard', // 技术债务仪表盘 — 本地分析数据
  'team-code-analytics', // 团队代码影响力分析器 — 本地团队数据
  'ai-code-review',      // AI代码审查 — 依赖 AI API key
  'api-development-kit', // 本地API开发套件 — Electron 专属
  'countdown-timer',     // 项目倒计时 — 本地倒计时数据
  'standup-helper',      // 每日站会助手 — 本地站会数据
  'interview-questions', // 技术面试题库 — 本地题库数据
  'dependency-security-scanner', // 依赖安全扫描 — 需要离线 CVE 库
  'code-search-navigator', // 代码搜索导航器 — Electron 专属
]);

// 隐藏的分类
const HIDDEN_CATEGORIES = new Set([
  '提效工具',
  '写作工具',
  '生活工具',
  'AI工具',
  '管理工具',
  '数据分析',
  '学习工具',
  '安全工具',
  '项目管理',
  '文档写作',
]);

let allTools = [];
let filteredTools = [];
let searchQuery = '';
let activeCategory = '全部';

// ==================== 加载 ====================
async function loadTools() {
  try {
    const resp = await fetch('./tools.json?t=' + Date.now());
    if (!resp.ok) throw new Error('fail');
    const data = await resp.json();
    // 过滤：排除隐藏 ID 和隐藏分类
    allTools = data.filter(t =>
      !HIDDEN_IDS.has(t.id) && !HIDDEN_CATEGORIES.has(t.category)
    );
  } catch {
    allTools = [];
  }
  filteredTools = [...allTools];
  renderCategoryTabs();
  render();
}

// ==================== 分类标签 ====================
function renderCategoryTabs() {
  const cats = ['全部', ...new Set(allTools.map(t => t.category).filter(Boolean))];
  const container = document.getElementById('category-tabs');
  container.innerHTML = cats.map(cat =>
    `<button class="category-tab ${cat === activeCategory ? 'active' : ''}" onclick="filterCategory('${cat}')">${cat}</button>`
  ).join('');
}

function filterCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.classList.toggle('active', tab.textContent === cat);
  });
  applyFilters();
}

// ==================== 搜索 ====================
function applyFilters() {
  filteredTools = allTools.filter(t => {
    const matchCat = activeCategory === '全部' || (t.category || '') === activeCategory;
    const matchSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery) ||
      t.description.toLowerCase().includes(searchQuery) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(searchQuery));
    return matchCat && matchSearch;
  });
  render();
}

function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// ==================== 渲染 ====================
function render() {
  const container = document.getElementById('tools-container');

  if (filteredTools.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>未找到匹配工具</h3>
        <p>试试其他关键词</p>
      </div>`;
    return;
  }

  container.innerHTML = filteredTools.map(tool => {
    const tagsHtml = (tool.tags || []).slice(0, 3).map(tag =>
      `<span class="tool-tag">${highlight(tag, searchQuery)}</span>`
    ).join('');

    return `
      <a class="tool-card" href="${tool.url}" target="_blank" rel="noopener">
        <div class="tool-card-header">
          <div class="tool-icon">${tool.icon || '🔧'}</div>
          <div class="tool-info">
            <div class="tool-name">${highlight(tool.name, searchQuery)}</div>
          </div>
        </div>
        <div class="tool-desc">${highlight(tool.description, searchQuery)}</div>
        <div class="tool-tags">${tagsHtml}</div>
      </a>`;
  }).join('');
}

// ==================== 快捷键 ====================
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const input = document.getElementById('search-input');
    input.focus();
    input.select();
  }
  if (e.key === 'Escape') {
    const input = document.getElementById('search-input');
    if (document.activeElement === input && input.value) {
      input.value = '';
      searchQuery = '';
      applyFilters();
    }
  }
});

let searchTimer;
document.getElementById('search-input').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchQuery = e.target.value.trim().toLowerCase();
  searchTimer = setTimeout(() => applyFilters(), 120);
});

// ==================== 初始化 ====================
loadTools();
