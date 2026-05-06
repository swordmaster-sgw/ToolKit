// 统计查询模块
import { json } from './utils.js';

export async function handleStats(request, env) {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const url = new URL(request.url);
    const days = Math.min(parseInt(url.searchParams.get('days') || '30'), 365);

    // 工具排行榜（按 PV 降序）
    const ranking = await env.DB.prepare(`
      SELECT 
        tool_id,
        tool_name,
        COUNT(*) as pv,
        COUNT(DISTINCT session_id) as uv
      FROM track 
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY tool_id, tool_name
      ORDER BY pv DESC
      LIMIT 50
    `).all();

    // 每日趋势
    const daily = await env.DB.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as pv,
        COUNT(DISTINCT session_id) as uv
      FROM track
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY date(created_at)
      ORDER BY date(created_at)
    `).all();

    // 总览
    const overview = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_pv,
        COUNT(DISTINCT session_id) as total_uv
      FROM track
      WHERE created_at >= datetime('now', '-${days} days')
    `).first();

    // 今日数据
    const today = await env.DB.prepare(`
      SELECT 
        COUNT(*) as pv,
        COUNT(DISTINCT session_id) as uv
      FROM track
      WHERE date(created_at) = date('now')
    `).first();

    return json({
      period: `${days}d`,
      overview,
      today,
      ranking: ranking.results,
      daily: daily.results,
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// 工具排行批量查询（前端卡片显示排名）
export async function handleRanking(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const { toolIds } = await request.json();
    if (!Array.isArray(toolIds) || toolIds.length === 0) {
      return json({});
    }

    const placeholders = toolIds.map(() => '?').join(',');
    const rows = await env.DB.prepare(`
      SELECT 
        tool_id,
        COUNT(*) as total_pv,
        COUNT(DISTINCT session_id) as total_uv
      FROM track
      WHERE tool_id IN (${placeholders})
      GROUP BY tool_id
    `).bind(...toolIds).all();

    const result = {};
    for (const row of rows.results) {
      result[row.tool_id] = { pv: row.total_pv, uv: row.total_uv };
    }
    return json(result);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
