/**
 * DevKit 通用主题管理系统 v3
 * 所有工具页面引入此文件即可获得主题切换能力
 *
 * 使用方法（最简）：
 *   <head> 中加：<script src="../../assets/js/theme.js"></script>
 *   <head> 中加防闪烁：<script>var t=localStorage.getItem('devkit-theme')||'dark';document.documentElement.setAttribute('data-theme',t);</script>
 *   <body> 中任意位置加：<div id="theme-container"></div>
 *   <body> 底部加：<script>ThemeManager.init('theme-container');</script>
 *
 * 支持两种页面：
 *   A) 使用 CSS 变量的页面（如 json-formatter）→ 通过 [data-theme] + CSS 变量切换
 *   B) 硬编码颜色的页面 → 通过注入 <style> 覆盖层强制覆盖常见颜色
 */

const ThemeManager = (() => {
  /* ===================== 主题定义 ===================== */
  const themes = {
    dark: {
      label: '深空暗黑', icon: '☀️', dotColor: '#8b5cf6',
      vars: {
        '--accent-primary': '#8b5cf6', '--accent-secondary': '#a78bfa',
        '--bg-primary': '#0f0f1a', '--bg-secondary': '#16162a', '--bg-tertiary': '#1e1e3a',
        '--bg-card': 'rgba(30,30,58,0.6)', '--bg-card-hover': 'rgba(38,38,70,0.8)',
        '--bg-glass': 'rgba(22,22,42,0.8)',
        '--border-subtle': 'rgba(255,255,255,0.06)', '--border-default': 'rgba(255,255,255,0.1)',
        '--border-hover': 'rgba(139,92,246,0.3)', '--border-active': 'rgba(139,92,246,0.5)',
        '--text-primary': '#f8fafc', '--text-secondary': '#94a3b8', '--text-muted': '#64748b',
        '--bg-base': '#0d1117', '--bg-surface': '#161b27', '--bg-elevated': '#1c2133',
        '--bg-overlay': '#222840', '--border-strong': '#3a4268', '--text-faint': '#2e3455',
      },
      overrides: {
        'body': { 'background': '#0d1117', 'color': '#e2e8f0' },
        '.header, .toolbar, .panel-header, .sidebar': { 'background': '#1a1d2e', 'border-color': '#2d3148' },
        '.card, .panel, .modal, .popup, .dropdown, .tooltip': { 'background': '#1a1d2e', 'border-color': '#2d3148' },
        'input, textarea, select': { 'background': '#0f1219', 'color': '#e2e8f0', 'border-color': '#2d3148' },
        'button, .btn': { 'color': '#e2e8f0' },
      }
    },
    light: {
      label: '清爽白天', icon: '🌞', dotColor: '#7c3aed',
      vars: {
        '--accent-primary': '#7c3aed', '--accent-secondary': '#6d28d9',
        '--bg-primary': '#f8f9fc', '--bg-secondary': '#ffffff', '--bg-tertiary': '#f1f3f8',
        '--bg-card': 'rgba(255,255,255,0.9)', '--bg-card-hover': 'rgba(255,255,255,1)',
        '--bg-glass': 'rgba(248,249,252,0.92)',
        '--border-subtle': 'rgba(0,0,0,0.06)', '--border-default': 'rgba(0,0,0,0.1)',
        '--border-hover': 'rgba(124,58,237,0.3)', '--border-active': 'rgba(124,58,237,0.5)',
        '--text-primary': '#111827', '--text-secondary': '#4b5563', '--text-muted': '#9ca3af',
        '--bg-base': '#f8f9fc', '--bg-surface': '#ffffff', '--bg-elevated': '#f1f3f8',
        '--bg-overlay': '#e8ebf2', '--border-strong': '#b0b5c4', '--text-faint': '#cbd5e1',
      },
      overrides: {
        'body': { 'background': '#f8f9fc', 'color': '#1e293b' },
        '.header, .toolbar, .panel-header, .sidebar': { 'background': '#ffffff', 'border-color': '#e2e5ed' },
        '.card, .panel, .modal, .popup, .dropdown, .tooltip': { 'background': '#ffffff', 'border-color': '#e2e5ed' },
        'input, textarea, select': { 'background': '#f1f3f8', 'color': '#1e293b', 'border-color': '#cdd1dc' },
        'button, .btn': { 'color': '#1e293b' },
      }
    },
    green: {
      label: '绿意盎然', icon: '🌿', dotColor: '#10b981',
      vars: {
        '--accent-primary': '#10b981', '--accent-secondary': '#34d399',
        '--bg-primary': '#0d1117', '--bg-secondary': '#161b22', '--bg-tertiary': '#21262d',
        '--bg-card': 'rgba(22,27,34,0.7)', '--bg-card-hover': 'rgba(33,38,45,0.9)',
        '--bg-glass': 'rgba(13,17,23,0.85)',
        '--border-subtle': 'rgba(255,255,255,0.05)', '--border-default': 'rgba(255,255,255,0.08)',
        '--border-hover': 'rgba(16,185,129,0.35)', '--border-active': 'rgba(16,185,129,0.55)',
        '--text-primary': '#e6edf3', '--text-secondary': '#8b949e', '--text-muted': '#484f58',
        '--bg-base': '#0d1117', '--bg-surface': '#161b22', '--bg-elevated': '#1c2128',
        '--bg-overlay': '#21262d', '--border-strong': '#484f58', '--text-faint': '#2d333b',
      },
      overrides: {
        'body': { 'background': '#0d1117', 'color': '#e6edf3' },
        '.header, .toolbar, .panel-header, .sidebar': { 'background': '#161b22', 'border-color': '#30363d' },
        '.card, .panel, .modal, .popup, .dropdown, .tooltip': { 'background': '#161b22', 'border-color': '#30363d' },
        'input, textarea, select': { 'background': '#0d1117', 'color': '#e6edf3', 'border-color': '#30363d' },
        'button, .btn': { 'color': '#e6edf3' },
      }
    },
    warm: {
      label: '暖橙暮色', icon: '🌅', dotColor: '#f59e0b',
      vars: {
        '--accent-primary': '#f59e0b', '--accent-secondary': '#fbbf24',
        '--bg-primary': '#16100a', '--bg-secondary': '#1e1810', '--bg-tertiary': '#2a2015',
        '--bg-card': 'rgba(30,24,16,0.7)', '--bg-card-hover': 'rgba(42,32,21,0.9)',
        '--bg-glass': 'rgba(22,16,10,0.85)',
        '--border-subtle': 'rgba(255,255,255,0.05)', '--border-default': 'rgba(255,255,255,0.08)',
        '--border-hover': 'rgba(245,158,11,0.35)', '--border-active': 'rgba(245,158,11,0.55)',
        '--text-primary': '#fef3c7', '--text-secondary': '#d4a054', '--text-muted': '#8b6914',
        '--bg-base': '#16100a', '--bg-surface': '#1e1810', '--bg-elevated': '#2a2015',
        '--bg-overlay': '#342a1c', '--border-strong': '#544020', '--text-faint': '#5a4510',
      },
      overrides: {
        'body': { 'background': '#16100a', 'color': '#fef3c7' },
        '.header, .toolbar, .panel-header, .sidebar': { 'background': '#1e1810', 'border-color': '#3d3018' },
        '.card, .panel, .modal, .popup, .dropdown, .tooltip': { 'background': '#1e1810', 'border-color': '#3d3018' },
        'input, textarea, select': { 'background': '#16100a', 'color': '#fef3c7', 'border-color': '#3d3018' },
        'button, .btn': { 'color': '#fef3c7' },
      }
    }
  };

  let currentTheme = 'dark';
  let overrideStyleEl = null;
  let initialized = false;
  let clickHandlerBound = false;

  /* ===================== 核心：注入硬编码颜色覆盖 ===================== */
  function injectOverrideStyle(themeName) {
    const theme = themes[themeName];
    if (!theme || !theme.overrides) return;

    let css = '';
    for (const [selector, props] of Object.entries(theme.overrides)) {
      const propStr = Object.entries(props).map(([k, v]) => `${k}:${v} !important`).join(';');
      css += `${selector}{${propStr}}`;
    }

    if (!overrideStyleEl) {
      overrideStyleEl = document.createElement('style');
      overrideStyleEl.id = 'theme-override';
      document.head.appendChild(overrideStyleEl);
    }
    overrideStyleEl.textContent = css;
  }

  /* ===================== 应用主题 ===================== */
  function applyTheme(themeName) {
    if (!themes[themeName]) themeName = 'dark';
    currentTheme = themeName;

    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('devkit-theme', themeName);

    // 注入 CSS 变量
    const root = document.documentElement;
    const theme = themes[themeName];
    if (theme.vars) {
      Object.entries(theme.vars).forEach(([prop, val]) => root.style.setProperty(prop, val));
    }

    // 注入硬编码颜色覆盖
    injectOverrideStyle(themeName);

    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeName } }));
  }

  /* ===================== 定位下拉框（fixed，避免 overflow 裁切） ===================== */
  function positionDropdown() {
    const btn = document.querySelector('#theme-switcher .theme-btn');
    const dd = document.getElementById('theme-dropdown');
    if (!btn || !dd) return;

    const rect = btn.getBoundingClientRect();
    dd.style.position = 'fixed';
    dd.style.top = (rect.bottom + 6) + 'px';
    dd.style.right = (window.innerWidth - rect.right) + 'px';
    dd.style.left = 'auto';
  }

  /* ===================== 创建切换 UI ===================== */
  function createThemeUI(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const theme = themes[currentTheme];
    container.innerHTML = `
      <div class="theme-switcher" id="theme-switcher">
        <button class="theme-btn" id="theme-toggle-btn" title="切换主题">
          <span class="theme-btn-icon">${theme.icon}</span>
          <span class="theme-btn-label">${options.showLabel !== false ? '主题' : ''}</span>
        </button>
        <div class="theme-dropdown" id="theme-dropdown">
          ${Object.entries(themes).map(([key, t]) => `
            <div class="theme-option ${key === currentTheme ? 'active' : ''}"
                 data-theme="${key}">
              <span class="theme-dot" style="background:${t.dotColor}"></span>
              ${t.label}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // 使用事件委托，避免 inline onclick 的冒泡问题
    const sw = document.getElementById('theme-switcher');
    const btn = document.getElementById('theme-toggle-btn');

    // 切换按钮点击
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    // 选项点击
    sw.querySelector('.theme-dropdown').addEventListener('click', (e) => {
      const option = e.target.closest('.theme-option');
      if (option) {
        e.stopPropagation();
        setTheme(option.dataset.theme);
      }
    });

    // 绑定全局点击关闭（只绑定一次）
    if (!clickHandlerBound) {
      document.addEventListener('click', () => closeDropdown());
      document.addEventListener('scroll', () => {
        if (document.getElementById('theme-dropdown')?.classList.contains('active')) {
          positionDropdown();
        }
      }, true);
      clickHandlerBound = true;
    }
  }

  /* ===================== API ===================== */
  function init(containerId, options = {}) {
    // 防止双重初始化
    if (initialized && containerId) {
      // 如果已经初始化，只更新 UI
      updateUI();
      return;
    }

    const saved = localStorage.getItem('devkit-theme') || 'dark';
    applyTheme(saved);
    if (containerId) createThemeUI(containerId, options);
    initialized = true;

    window.addEventListener('storage', (e) => {
      if (e.key === 'devkit-theme' && e.newValue) { applyTheme(e.newValue); updateUI(); }
    });
  }

  function toggleDropdown() {
    const dd = document.getElementById('theme-dropdown');
    if (!dd) return;
    const isOpen = dd.classList.toggle('active');
    if (isOpen) positionDropdown();
  }

  function closeDropdown() {
    const dd = document.getElementById('theme-dropdown');
    if (dd) dd.classList.remove('active');
  }

  function setTheme(name) {
    applyTheme(name);
    updateUI();
    closeDropdown();
  }

  function updateUI() {
    const theme = themes[currentTheme];
    const icon = document.querySelector('.theme-btn-icon');
    const label = document.querySelector('.theme-btn-label');
    if (icon) icon.textContent = theme.icon;
    if (label) label.textContent = theme.label;
    document.querySelectorAll('.theme-option').forEach(el =>
      el.classList.toggle('active', el.dataset.theme === currentTheme));
  }

  function getTheme() { return currentTheme; }
  function getThemes() { return { ...themes }; }

  return { init, applyTheme, setTheme, toggleDropdown, closeDropdown, getTheme, getThemes, themes };
})();
