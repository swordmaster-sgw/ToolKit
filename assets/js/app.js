/**
 * DevKit - 开发者工具集导航
 * 功能：工具加载、搜索、分类筛选、内联详情展开
 */

// ==================== 内嵌工具数据（只展示公开部署的工具） ====================
const TOOLS_DATA = [
  {
    id: 'json-formatter',
    name: 'JSON 格式化 / 压缩',
    description: 'JSON 格式化美化、压缩、语法校验，支持树形折叠展开，开发必备。',
    category: '开发工具',
    tags: ['JSON', '格式化', '校验', '压缩'],
    version: '1.0.0',
    url: './tools/json-formatter/index.html',
    icon: '📋',
    features: [
      '智能格式化与压缩',
      '树形折叠展开',
      '语法校验与错误定位',
      '节点路径高亮',
      'JSON 路径查询（JSONPath）',
    ]
  },
  {
    id: 'regex-tester',
    name: '正则表达式测试器',
    description: '实时高亮匹配，支持标记(flags)，捕获组提取，常用正则快速引用。',
    category: '开发工具',
    tags: ['正则', 'Regex', '测试', '匹配'],
    version: '1.0.0',
    url: './tools/regex-tester/index.html',
    icon: '🔍',
    features: [
      '实时匹配高亮',
      '捕获组提取',
      '常用正则模板库',
      'Flags 快速切换',
    ]
  },
  {
    id: 'base64-codec',
    name: 'Base64 编解码',
    description: '文本 / 文件 Base64 编码与解码，支持 URL-safe 模式，一键复制。',
    category: '开发工具',
    tags: ['Base64', '编码', '解码'],
    version: '1.0.0',
    url: './tools/base64-codec/index.html',
    icon: '🔐',
    features: [
      '文本 Base64 编码/解码',
      '文件 Base64 编解码',
      'URL-safe 模式',
      '一键复制结果',
    ]
  },
  {
    id: 'timestamp-converter',
    name: '时间戳转换',
    description: 'Unix 时间戳 ↔ 可读日期时间互转，支持毫秒/秒，显示多时区。',
    category: '开发工具',
    tags: ['时间戳', '时间', '日期', '转换'],
    version: '1.0.0',
    url: './tools/timestamp-converter/index.html',
    icon: '⏱️',
    features: [
      '时间戳 ↔ 日期互转',
      '毫秒/秒单位切换',
      '多时区同时显示',
      '实时当前时间戳',
    ]
  },
  {
    id: 'color-converter',
    name: '颜色转换器',
    description: 'HEX、RGB、HSL 三种格式互转，取色板，生成渐变代码，前端开发利器。',
    category: '开发工具',
    tags: ['颜色', 'HEX', 'RGB', 'HSL', '前端'],
    version: '1.0.0',
    url: './tools/color-converter/index.html',
    icon: '🎨',
    features: [
      'HEX / RGB / HSL 互转',
      '可视化取色板',
      '渐变代码生成',
      '颜色对比度检查',
    ]
  },
  {
    id: 'jwt-decoder',
    name: 'JWT 解析器',
    description: '解码 JWT Token，展示 Header、Payload、签名，检查过期时间，无需密钥。',
    category: '开发工具',
    tags: ['JWT', 'Token', '认证', '解析'],
    version: '1.0.0',
    url: './tools/jwt-decoder/index.html',
    icon: '🎫',
    features: [
      '解码 Header / Payload',
      '签名算法显示',
      '过期时间检测与高亮',
      'JSON 格式化展示',
    ]
  },
  {
    id: 'text-process',
    name: '文本批处理工具',
    description: '文本去重、排序、计行数、替换、大小写转换、JSON转义等多种文本操作，一站式搞定。',
    category: '数据处理',
    tags: ['文本', '处理', '去重', '替换', '格式化'],
    version: '1.0.0',
    url: './tools/text-process/index.html',
    icon: '📝',
    features: [
      '文本去重与排序',
      '批量查找替换',
      '大小写转换',
      '行数统计与 JSON 转义',
    ]
  },
];

// ==================== 状态管理 ====================
const AppState = {
  tools: [],
  filtered: [],
  activeCategory: 'all',
  searchQuery: '',
  viewMode: 'grid',
  expandedCard: null, // 当前展开详情的卡片 id
};

// ==================== 类别颜色 ====================
const CATEGORY_COLORS = {
  '开发工具': '#3b82f6',
  '数据处理': '#06b6d4',
};

function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat] || '#8b90a7';
}

// ==================== 工具加载 ====================
async function loadTools() {
  try {
    const resp = await fetch('./tools.json?t=' + Date.now());
    if (!resp.ok) throw new Error('fail');
    const allTools = await resp.json();
    // 只显示 TOOLS_DATA 里定义的工具
    const showIds = new Set(TOOLS_DATA.map(t => t.id));
    AppState.tools = allTools.filter(t => showIds.has(t.id)).map(t => {
      // 补充 features 字段
      const base = TOOLS_DATA.find(b => b.id === t.id);
      return { ...t, features: base?.features || [] };
    });
  } catch (e) {
    AppState.tools = TOOLS_DATA;
  }
  renderCategoryTabs();
  applyFilters();
}

// ==================== 分类标签 ====================
function renderCategoryTabs() {
  // 只显示有工具的分类
  const cats = ['all', ...new Set(AppState.tools.map(t => t.category))];
  const container = document.getElementById('category-tabs');
  if (!container) return;

  container.innerHTML = cats.map(cat => {
    const isAll = cat === 'all';
    const label = isAll ? '全部' : cat;
    const count = isAll ? AppState.tools.length : AppState.tools.filter(t => t.category === cat).length;
    const active = AppState.activeCategory === cat ? 'active' : '';
    return `<button class="filter-tab ${active}" onclick="setCategory('${cat}')">
      ${!isAll ? `<span class="category-dot" style="background:${getCategoryColor(cat)}"></span>` : ''}
      ${label} <span class="tab-count">${count}</span>
    </button>`;
  }).join('');
}

function setCategory(cat) {
  AppState.activeCategory = cat;
  renderCategoryTabs();
  applyFilters();
}

// ==================== 搜索 & 过滤 ====================
function applyFilters() {
  let list = [...AppState.tools];

  if (AppState.activeCategory !== 'all') {
    list = list.filter(t => t.category === AppState.activeCategory);
  }

  const q = AppState.searchQuery.toLowerCase().trim();
  if (q) {
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }

  AppState.filtered = list;
  renderTools(list);
}

// ==================== 渲染工具列表 ====================
function renderTools(tools) {
  const grid = document.getElementById('tools-grid');
  const countEl = document.getElementById('tools-count');

  countEl.textContent = `共 ${tools.length} 个工具`;

  if (tools.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔍</div>
        <h3>未找到匹配工具</h3>
        <p>试试其他关键词或切换分类</p>
      </div>`;
    return;
  }

  grid.innerHTML = tools.map(tool => renderToolCard(tool)).join('');
}

function renderToolCard(tool) {
  const isExpanded = AppState.expandedCard === tool.id;
  const tagsHtml = (tool.tags || []).slice(0, 3).map(tag =>
    `<span class="tool-tag">${tag}</span>`
  ).join('');

  const featuresHtml = (tool.features || []).length > 0
    ? `<ul class="feature-list">${tool.features.map(f => `<li>${f}</li>`).join('')}</ul>`
    : `<p class="detail-text">${tool.description}</p>`;

  return `
    <div class="tool-card" data-id="${tool.id}">
      <div class="tool-card-header" onclick="openTool('${tool.url}')">
        <div class="tool-icon">${tool.icon || '🔧'}</div>
        <div style="flex:1">
          <div class="tool-name">${tool.name}</div>
          <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
            <span class="category-dot" style="background:${getCategoryColor(tool.category)}"></span>
            <span class="tool-category-label">${tool.category}</span>
          </div>
        </div>
      </div>
      <div class="tool-description">${tool.description}</div>
      ${tagsHtml ? `<div class="tool-tags">${tagsHtml}</div>` : ''}
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="event.stopPropagation();openTool('${tool.url}')">
          <span class="btn-icon">↗</span> 打开工具
        </button>
        <button class="btn btn-ghost" onclick="event.stopPropagation();toggleDetail('${tool.id}')">
          <span class="btn-icon chevron ${isExpanded ? 'expanded' : ''}">›</span>
          ${isExpanded ? '收起详情' : '查看详情'}
        </button>
      </div>
      <div class="tool-detail ${isExpanded ? 'open' : ''}">
        <div class="detail-divider"></div>
        <div class="detail-content">${featuresHtml}</div>
      </div>
    </div>`;
}

// ==================== 交互 ====================
function openTool(url) {
  window.open(url, '_blank');
}

function toggleDetail(id) {
  AppState.expandedCard = AppState.expandedCard === id ? null : id;
  renderTools(AppState.filtered);
}

// ==================== 视图切换 ====================
function setViewMode(mode) {
  AppState.viewMode = mode;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.view-btn[data-mode="${mode}"]`).classList.add('active');
  document.getElementById('tools-grid').className = `tools-grid ${mode === 'list' ? 'list-view' : ''}`;
}

// ==================== 键盘事件 ====================
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const input = document.getElementById('search-input');
    input.focus();
    input.select();
  }
});

document.getElementById('search-input').addEventListener('input', e => {
  AppState.searchQuery = e.target.value;
  applyFilters();
});

// ==================== 初始化 ====================
loadTools();
