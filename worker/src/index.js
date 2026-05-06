// Worker 入口 — 路由分发
import { json } from './utils.js';
import { handleTrack } from './track.js';
import { handleStats, handleRanking } from './stats.js';
import { handleFeedback } from './feedback.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // 路由
    if (path === '/api/health') {
      return json({ status: 'ok', time: new Date().toISOString() });
    }

    if (path === '/api/track') {
      return handleTrack(request, env);
    }

    if (path === '/api/stats') {
      return handleStats(request, env);
    }

    if (path === '/api/tools/ranking') {
      return handleRanking(request, env);
    }

    if (path === '/api/feedback') {
      return handleFeedback(request, env);
    }

    return json({ error: 'Not found' }, 404);
  },
};
