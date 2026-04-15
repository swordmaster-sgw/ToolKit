const http = require('http');

// 添加更多工具
const toolFunctions = {
  // JSON 格式化
  'json-formatter': {
    exec: (params) => {
      const { input, action = 'format', indent = 2 } = params;
      try {
        if (action === 'validate') { JSON.parse(input); return { success: true, result: 'Valid JSON' }; }
        const parsed = JSON.parse(input);
        if (action === 'minify') return { success: true, result: JSON.stringify(parsed) };
        return { success: true, result: JSON.stringify(parsed, null, parseInt(indent)) };
      } catch (e) { return { success: false, error: e.message }; }
    }
  },

  // Base64 编解码
  'base64-codec': {
    exec: (params) => {
      const { text, action = 'encode' } = params;
      try {
        if (action === 'encode') return { success: true, result: Buffer.from(text).toString('base64') };
        return { success: true, result: Buffer.from(text, 'base64').toString('utf-8') };
      } catch (e) { return { success: false, error: e.message }; }
    }
  },

  // UUID 生成
  'uuid-generator': {
    exec: (params) => {
      const { count = 1, uppercase = false, hyphen = true } = params;
      const uuids = [];
      for (let i = 0; i < count; i++) {
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        if (!hyphen) uuid = uuid.replace(/-/g, '');
        if (uppercase) uuid = uuid.toUpperCase();
        uuids.push(uuid);
      }
      return { success: true, result: count === 1 ? uuids[0] : uuids };
    }
  },

  // Hash 计算
  'hash-calculator': {
    exec: (params) => {
      const crypto = require('crypto');
      const { text, algorithm = 'sha256' } = params;
      const hash = crypto.createHash(algorithm).update(text).digest('hex');
      return { success: true, result: hash };
    }
  },

  // URL 编解码
  'url-codec': {
    exec: (params) => {
      const { text, action = 'encode' } = params;
      try {
        if (action === 'encode') return { success: true, result: encodeURIComponent(text) };
        if (action === 'decode') return { success: true, result: decodeURIComponent(text) };
        if (action === 'parse') {
          const urlObj = new URL(text);
          return { success: true, result: { href: urlObj.href, protocol: urlObj.protocol, host: urlObj.host, pathname: urlObj.pathname, params: Object.fromEntries(urlObj.searchParams) } };
        }
      } catch (e) { return { success: false, error: e.message }; }
    }
  },

  // JWT 解析
  'jwt-decoder': {
    exec: (params) => {
      const { token } = params;
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return { success: false, error: 'Invalid JWT format' };
        const decode = (str) => JSON.parse(Buffer.from(str, 'base64').toString('utf-8'));
        return { success: true, result: { header: decode(parts[0]), payload: decode(parts[1]), signature: parts[2] } };
      } catch (e) { return { success: false, error: e.message }; }
    }
  },

  // 密码生成
  'password-gen': {
    exec: (params) => {
      const { length = 16, uppercase = true, lowercase = true, numbers = true, symbols = true, count = 1 } = params;
      let chars = '';
      if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
      if (numbers) chars += '0123456789';
      if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
      if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
      const passwords = [];
      for (let c = 0; c < count; c++) {
        let password = '';
        for (let i = 0; i < length; i++) password += chars[Math.floor(Math.random() * chars.length)];
        passwords.push(password);
      }
      return { success: true, result: count === 1 ? passwords[0] : passwords };
    }
  },

  // 文本处理
  'text-process': {
    exec: (params) => {
      const { text, action = 'dedup' } = params;
      const lines = text.split('\n');
      let result;
      switch (action) {
        case 'dedup': result = [...new Set(lines)].join('\n'); break;
        case 'sort': result = lines.sort().join('\n'); break;
        case 'count': result = { lines: lines.length, chars: text.length, words: text.split(/\s+/).filter(w => w).length }; break;
        case 'case': result = text.toUpperCase(); break;
        case 'reverse': result = text.split('\n').reverse().join('\n'); break;
        case 'escape': result = text.replace(/["'\\]/g, '\\$&'); break;
        case 'unescape': result = text.replace(/\\(.)/g, '$1'); break;
        default: result = text;
      }
      return { success: true, result };
    }
  },

  // 时间戳转换
  'timestamp-converter': {
    exec: (params) => {
      const { value, action = 'toDate', milliseconds = false } = params;
      try {
        if (action === 'toDate') {
          const ts = milliseconds ? parseInt(value) : parseInt(value) * 1000;
          const date = new Date(ts);
          return { success: true, result: { timestamp: ts, iso: date.toISOString(), local: date.toLocaleString('zh-CN') } };
        } else {
          const date = new Date(value);
          const ts = milliseconds ? date.getTime() : Math.floor(date.getTime() / 1000);
          return { success: true, result: { date: value, timestamp: ts, milliseconds } };
        }
      } catch (e) { return { success: false, error: e.message }; }
    }
  },

  // 进制转换
  'number-converter': {
    exec: (params) => {
      const { value, fromBase = 10, toBase = 16 } = params;
      try {
        const num = parseInt(value, parseInt(fromBase));
        if (isNaN(num)) throw new Error('Invalid number');
        return { success: true, result: { original: value, converted: num.toString(parseInt(toBase)), from: fromBase, to: toBase } };
      } catch (e) { return { success: false, error: e.message }; }
    }
  },

  // 颜色转换
  'color-converter': {
    exec: (params) => {
      const { color, targetFormat = 'all' } = params;
      const hexToRgb = (hex) => { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null; };
      const rgbToHsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h, s, l = (max + min) / 2; if (max === min) { h = s = 0; } else { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; } h /= 6; } return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }; };
      const rgb = hexToRgb(color);
      if (!rgb) return { success: false, error: 'Invalid color format' };
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const result = targetFormat === 'all' ? { hex: color, rgb: `rgb(${rgb.r},${rgb.g},${rgb.b})`, hsl: `hsl(${hsl.h},${hsl.s}%,${hsl.l}%)` } : targetFormat === 'rgb' ? `rgb(${rgb.r},${rgb.g},${rgb.b})` : targetFormat === 'hsl' ? `hsl(${hsl.h},${hsl.s}%,${hsl.l}%)` : color;
      return { success: true, result };
    }
  },

  // Cron 解析
  'cron-helper': {
    exec: (params) => {
      const { expression } = params;
      const parts = expression.split(' ');
      if (parts.length < 5) return { success: false, error: 'Invalid cron expression' };
      const now = new Date();
      const next = new Date(now.getTime() + 3600000);
      return { success: true, result: { expression, parts: { minute: parts[0], hour: parts[1], day: parts[2], month: parts[3], weekday: parts[4] }, nextRun: next.toISOString(), description: `每 ${parts[0]} 分 ${parts[1]} 时执行` } };
    }
  },

  // HTTP 状态码
  'http-status': {
    exec: (params) => {
      const { code } = params;
      const statusCodes = {
        '200': { message: 'OK', description: '请求成功' }, '201': { message: 'Created', description: '资源创建成功' },
        '204': { message: 'No Content', description: '请求成功，无返回内容' }, '400': { message: 'Bad Request', description: '请求语法错误' },
        '401': { message: 'Unauthorized', description: '未授权，需要认证' }, '403': { message: 'Forbidden', description: '拒绝访问' },
        '404': { message: 'Not Found', description: '资源不存在' }, '500': { message: 'Internal Server Error', description: '服务器内部错误' },
        '502': { message: 'Bad Gateway', description: '网关错误' }, '503': { message: 'Service Unavailable', description: '服务不可用' },
        '504': { message: 'Gateway Timeout', description: '网关超时' }
      };
      const info = statusCodes[code];
      return info ? { success: true, result: { code, ...info } } : { success: false, error: 'Unknown status code' };
    }
  },

  // 正则测试
  'regex-tester': {
    exec: (params) => {
      const { pattern, text, flags = 'g' } = params;
      try {
        const regex = new RegExp(pattern, flags);
        const matches = text.match(regex);
        return { success: true, result: { matches: matches || [], count: matches?.length || 0 } };
      } catch (e) { return { success: false, error: e.message }; }
    }
  },

  // CSV <-> JSON
  'csv-json': {
    exec: (params) => {
      const { data, action = 'csvToJson', delimiter = ',' } = params;
      try {
        if (action === 'csvToJson') {
          const lines = data.trim().split('\n');
          const headers = lines[0].split(delimiter).map(h => h.trim());
          const result = lines.slice(1).map(line => { const values = line.split(delimiter); const obj = {}; headers.forEach((h, i) => obj[h] = values[i]?.trim()); return obj; });
          return { success: true, result };
        } else if (action === 'jsonToCsv') {
          const arr = typeof data === 'string' ? JSON.parse(data) : data;
          if (!Array.isArray(arr)) return { success: false, error: 'Input must be an array' };
          const headers = Object.keys(arr[0] || {});
          const csv = [headers.join(delimiter)];
          arr.forEach(obj => csv.push(headers.map(h => obj[h] || '').join(delimiter)));
          return { success: true, result: csv.join('\n') };
        }
      } catch (e) { return { success: false, error: e.message }; }
    }
  },

  // 文本 Diff
  'text-diff': {
    exec: (params) => {
      const { oldText, newText } = params;
      const oldLines = oldText.split('\n');
      const newLines = newText.split('\n');
      const diff = [];
      let i = 0, j = 0;
      while (i < oldLines.length || j < newLines.length) {
        if (i >= oldLines.length) { diff.push({ type: 'add', line: newLines[j], newLineNum: j + 1 }); j++; }
        else if (j >= newLines.length) { diff.push({ type: 'remove', line: oldLines[i], oldLineNum: i + 1 }); i++; }
        else if (oldLines[i] === newLines[j]) { diff.push({ type: 'same', line: oldLines[i], oldLineNum: i + 1, newLineNum: j + 1 }); i++; j++; }
        else { diff.push({ type: 'remove', line: oldLines[i], oldLineNum: i + 1 }); diff.push({ type: 'add', line: newLines[j], newLineNum: j + 1 }); i++; j++; }
      }
      return { success: true, result: diff };
    }
  },

  // SQL 格式化
  'sql-formatter': {
    exec: (params) => {
      const { sql, action = 'format' } = params;
      try {
        if (action === 'minify') return { success: true, result: sql.replace(/\s+/g, ' ').trim() };
        let formatted = sql.replace(/\s+/g, ' ').replace(/\s*(,|;|\(|OR|AND|ORDER BY|GROUP BY|WHERE|JOIN|LEFT|RIGHT|INNER)\s*/gi, '\n$1\n').trim();
        return { success: true, result: formatted };
      } catch (e) { return { success: false, error: e.message }; }
    }
  },

  // 数据脱敏
  'data-masking': {
    exec: (params) => {
      const { data, type = 'all' } = params;
      let result = data;
      const maskPhone = (str) => str.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      const maskIdCard = (str) => str.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
      const maskEmail = (str) => str.replace(/(\w)(\w+)(\w)(@[\w.]+)/, '$1***$3$4');
      const maskBankCard = (str) => str.replace(/(\d{4})\d+(\d{4})/, '$1****$2');
      if (type === 'all' || type === 'phone') result = result.replace(/\d{11}/g, m => maskPhone(m));
      if (type === 'all' || type === 'idCard') result = result.replace(/\d{17}[\dXx]/g, m => maskIdCard(m));
      if (type === 'all' || type === 'email') result = result.replace(/[\w.]+@[\w.]+/g, m => maskEmail(m));
      if (type === 'all' || type === 'bankCard') result = result.replace(/\d{16,19}/g, m => maskBankCard(m));
      return { success: true, result };
    }
  },

  // 日志分析
  'log-analyzer': {
    exec: (params) => {
      const { log, level = 'error' } = params;
      const lines = log.split('\n');
      const levels = { error: 0, warn: 1, info: 2, debug: 3 };
      const targetLevel = levels[level] || 0;
      const filtered = lines.filter(line => { const lineLower = line.toLowerCase(); for (const [lvl, idx] of Object.entries(levels)) { if (lineLower.includes(lvl) && idx >= targetLevel) return true; } return false; });
      const stats = {}; Object.keys(levels).forEach(l => stats[l] = 0);
      lines.forEach(line => { const lineLower = line.toLowerCase(); Object.keys(levels).forEach(l => { if (lineLower.includes(l)) stats[l]++; }); });
      return { success: true, result: { filtered, stats, total: lines.length, matched: filtered.length } };
    }
  },

  // Markdown 预览
  'markdown-preview': {
    exec: (params) => {
      const { content } = params;
      let html = content.replace(/^### (.*$)/gim, '<h3>$1</h3>').replace(/^## (.*$)/gim, '<h2>$1</h2>').replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>').replace(/\*(.*)\*/gim, '<em>$1</em>').replace(/`([^`]+)`/gim, '<code>$1</code>').replace(/\n/gim, '<br>');
      return { success: true, result: html };
    }
  },

  // 命令速查
  'cmd-cheatsheet': {
    exec: (params) => {
      const { command, category = 'all' } = params;
      const commands = {
        git: { init: 'git init', clone: 'git clone <url>', commit: 'git commit -m "message"', push: 'git push origin main', pull: 'git pull', branch: 'git branch', checkout: 'git checkout -b <branch>', merge: 'git merge <branch>', status: 'git status', log: 'git log' },
        docker: { ps: 'docker ps', images: 'docker images', run: 'docker run -it <image>', build: 'docker build -t <name> .', exec: 'docker exec -it <container> bash', logs: 'docker logs <container>', stop: 'docker stop <container>', rm: 'docker rm <container>' },
        linux: { ls: 'ls -la', cd: 'cd <dir>', mkdir: 'mkdir <dir>', rm: 'rm -rf <dir>', cp: 'cp <src> <dst>', mv: 'mv <src> <dst>', cat: 'cat <file>', grep: 'grep <pattern> <file>', chmod: 'chmod 755 <file>', ps: 'ps aux' }
      };
      let result = commands[category] || commands;
      if (command && category !== 'all') result = result[command] || `命令 ${command} 未找到`;
      return { success: true, result };
    }
  },

  // 环境配置对比
  'env-diff': {
    exec: (params) => {
      const { env1, env2 } = params;
      const parseEnv = (text) => Object.fromEntries(text.split('\n').filter(l => l.includes('=')).map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; }));
      const e1 = parseEnv(env1);
      const e2 = parseEnv(env2);
      const allKeys = [...new Set([...Object.keys(e1), ...Object.keys(e2)])];
      const diff = allKeys.map(k => ({ key: k, env1: e1[k] || '', env2: e2[k] || '', status: e1[k] === e2[k] ? 'same' : e1[k] ? 'modified' : 'added' }));
      return { success: true, result: diff };
    }
  },

  // Bug 报告生成
  'bug-report': {
    exec: (params) => {
      const { title, description, steps, expected, actual, severity = 'medium' } = params;
      const report = `# Bug Report

**Title:** ${title}
**Severity:** ${severity}

## Description
${description}

## Steps to Reproduce
${steps || 'N/A'}

## Expected Result
${expected || 'N/A'}

## Actual Result
${actual || 'N/A'}
`;
      return { success: true, result: report };
    }
  },

  // 周报生成
  'weekly-report': {
    exec: (params) => {
      const { thisWeek, nextWeek, highlights } = params;
      const report = `# 周报

## 本周工作
${thisWeek || '无'}

## 亮点工作
${highlights || '无'}

## 下周计划
${nextWeek || '无'}
`;
      return { success: true, result: report };
    }
  },

  // 站会助手
  'standup-helper': {
    exec: (params) => {
      const { yesterday, today, blockers, format = 'markdown' } = params;
      if (format === 'text') {
        return { success: true, result: `昨日: ${yesterday || '无'}\n今日: ${today || '无'}\n阻塞: ${blockers || '无'}` };
      }
      const report = `## 昨日完成
${yesterday || '无'}

## 今日计划
${today || '无'}

## 阻塞问题
${blockers || '无'}`;
      return { success: true, result: report };
    }
  },

  // 会议纪要
  'meeting-minutes': {
    exec: (params) => {
      const { title, participants, decisions, actions } = params;
      const report = `# 会议纪要: ${title}

## 参会人员
${participants || '无'}

## 决议事项
${decisions || '无'}

## 行动项
${actions || '无'}
`;
      return { success: true, result: report };
    }
  },

  // API Mock
  'api-mock': {
    exec: (params) => {
      const { method = 'GET', path, description, params: reqParams, response } = params;
      const doc = `# ${method} ${path}

## ${description || '接口描述'}

### 请求参数
\`\`\`json
${reqParams || '{}'}
\`\`\`

### 响应示例
\`\`\`json
${response || '{}'}
\`\`\`
`;
      return { success: true, result: doc };
    }
  },

  // 倒计时
  'countdown-timer': {
    exec: (params) => {
      const { target, date } = params;
      const targetDate = new Date(date);
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) return { success: true, result: { target, status: 'expired', message: '已过期' } };
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return { success: true, result: { target, targetDate: date, remaining: { days, hours, minutes, seconds }, totalMs: diff } };
    }
  },

  // PPT 大纲
  'ppt-outline': {
    exec: (params) => {
      const { topic, slides = 10 } = params;
      const outline = [
        { title: '封面', content: `${topic}` },
        { title: '目录', content: '1.背景 2.问题 3.方案 4.实施 5.总结' },
        { title: '背景与动机', content: '为什么做？有什么价值？' },
        { title: '问题分析', content: '当前痛点与挑战' },
        { title: '解决方案', content: '核心方案设计思路' },
        { title: '技术架构', content: '系统架构与技术选型' },
        { title: '实施计划', content: '里程碑与时间安排' },
        { title: '预期效果', content: '量化收益与价值' },
        { title: '风险与对策', content: '潜在风险与缓解措施' },
        { title: '总结', content: '回顾与展望' }
      ].slice(0, slides);
      return { success: true, result: { topic, slides: outline } };
    }
  },

  // 技术文档模板
  'tech-doc-template': {
    exec: (params) => {
      const { title, background, requirements } = params;
      const doc = `# 技术方案: ${title}

## 1. 背景介绍
${background || '（请填写）'}

## 2. 需求概述
${requirements || '（请填写）'}

## 3. 技术方案设计
### 3.1 总体架构
（请描述系统架构）

### 3.2 核心模块
（请描述核心模块设计）

## 4. 数据设计
（请描述数据模型）

## 5. 接口设计
（请描述 API 设计）

## 6. 风险评估
（请列出潜在风险及应对措施）

## 7. 实施计划
（请列出时间计划）

## 8. 附录
（参考资料、术语表等）
`;
      return { success: true, result: doc };
    }
  },

  // 甘特图
  'gantt-chart': {
    exec: (params) => {
      const { tasks, format = 'markdown' } = params;
      const taskList = typeof tasks === 'string' ? JSON.parse(tasks) : tasks;
      if (format === 'mermaid') {
        const chart = ['gantt', 'title 项目进度', 'dateFormat YYYY-MM-DD'].concat(taskList.map(t => `${t.name} : ${t.start}, ${t.duration}d`)).join('\n');
        return { success: true, result: chart };
      }
      return { success: true, result: taskList };
    }
  },

  // 优先级矩阵
  'priority-matrix': {
    exec: (params) => {
      const { items } = params;
      const list = typeof items === 'string' ? JSON.parse(items) : items;
      const matrix = { urgentImportant: [], urgentNotImportant: [], notUrgentImportant: [], notUrgentNotImportant: [] };
      list.forEach(item => {
        if (item.urgent && item.important) matrix.urgentImportant.push(item);
        else if (item.urgent && !item.important) matrix.urgentNotImportant.push(item);
        else if (!item.urgent && item.important) matrix.notUrgentImportant.push(item);
        else matrix.notUrgentNotImportant.push(item);
      });
      return { success: true, result: matrix };
    }
  }
};

module.exports = toolFunctions;
