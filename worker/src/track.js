// 埋点模块
import { json } from './utils.js';

export async function handleTrack(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await request.json();
    const { toolId, toolName, sessionId } = body;

    if (!toolId || !sessionId) {
      return json({ error: '缺少必填参数: toolId, sessionId' }, 400);
    }

    const ip = request.headers.get('CF-Connecting-IP') || '';
    const userAgent = request.headers.get('User-Agent') || '';

    // 同一 session 同一工具同一天只记录一次（UV 去重）
    const today = new Date().toISOString().slice(0, 10);
    const existing = await env.DB.prepare(
      'SELECT id FROM track WHERE tool_id = ? AND session_id = ? AND date(created_at) = ?'
    ).bind(toolId, sessionId, today).first();

    if (existing) {
      return json({ ok: true, duplicated: true });
    }

    await env.DB.prepare(
      'INSERT INTO track (tool_id, tool_name, session_id, ip, user_agent) VALUES (?, ?, ?, ?, ?)'
    ).bind(toolId, toolName || toolId, sessionId, ip, userAgent).run();

    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
