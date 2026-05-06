// 反馈模块（提交反馈 + 自动同步 GitHub Issue）
import { json } from './utils.js';

export async function handleFeedback(request, env) {
  if (request.method === 'POST') {
    return submitFeedback(request, env);
  }
  if (request.method === 'GET') {
    return listFeedback(request, env);
  }
  return json({ error: 'Method not allowed' }, 405);
}

async function submitFeedback(request, env) {
  try {
    const body = await request.json();
    const { type = 'suggestion', toolId, toolName, content, contact } = body;

    if (!content || !content.trim()) {
      return json({ error: '反馈内容不能为空' }, 400);
    }

    const ip = request.headers.get('CF-Connecting-IP') || '';

    // 存入 D1
    const result = await env.DB.prepare(
      'INSERT INTO feedback (type, tool_id, tool_name, content, contact, ip) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(type, toolId || '', toolName || '', content.trim(), contact || '', ip).run();

    const feedbackId = result.meta.last_row_id;

    // 同步到 GitHub Issues
    let issueUrl = null;
    if (env.GITHUB_TOKEN && env.GITHUB_OWNER && env.GITHUB_REPO) {
      issueUrl = await createGitHubIssue(env, { type, toolId, toolName, content, contact, feedbackId });
    }

    // 更新 issue URL
    if (issueUrl) {
      await env.DB.prepare(
        'UPDATE feedback SET github_issue_url = ? WHERE id = ?'
      ).bind(issueUrl, feedbackId).run();
    }

    return json({ ok: true, id: feedbackId, issueUrl });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

async function listFeedback(request, env) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'open';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);

    const rows = await env.DB.prepare(`
      SELECT id, type, tool_id, tool_name, content, contact, github_issue_url, status, created_at
      FROM feedback
      WHERE status = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(status, limit).all();

    return json(rows.results);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

async function createGitHubIssue(env, { type, toolId, toolName, content, contact, feedbackId }) {
  const typeLabels = { bug: '🐛 Bug', suggestion: '💡 建议', feature: '🚀 新功能', other: '📝 其他' };
  const typeLabel = typeLabels[type] || typeLabels.other;

  const title = `[${typeLabel}] ${toolName ? `${toolName} - ` : ''}${content.slice(0, 50)}`;

  const body = [
    `> 来自 ToolKit 用户反馈 #${feedbackId}`,
    '',
    `**类型**: ${typeLabel}`,
    toolName ? `**工具**: ${toolName} (${toolId})` : '',
    '',
    '## 反馈内容',
    content,
    '',
    contact ? `**联系方式**: ${contact}` : '',
    '',
    '---',
    `_此 Issue 由用户反馈自动创建_`,
  ].filter(Boolean).join('\n');

  const resp = await fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Toolkit-Feedback-Bot',
    },
    body: JSON.stringify({
      title,
      body,
      labels: ['user-feedback'],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error('GitHub Issue 创建失败:', err);
    return null;
  }

  const data = await resp.json();
  return data.html_url;
}
