const http = require('http');

function test(toolId, params) {
  return new Promise((resolve) => {
    const data = JSON.stringify(params);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/exec/' + toolId,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, res => {
      let r = '';
      res.on('data', c => r += c);
      res.on('end', () => resolve({ id: toolId, response: r }));
    });
    req.on('error', e => resolve({ id: toolId, error: e.message }));
    req.write(data);
    req.end();
  });
}

async function run() {
  const tests = [
    { id: 'data-masking', params: { data: '手机:13812345678', type: 'all' } },
    { id: 'bug-report', params: { title: '登录失败', description: '无法登录' } },
    { id: 'weekly-report', params: { thisWeek: '完成功能A' } },
    { id: 'standup-helper', params: { yesterday: '完成代码', today: '写测试' } },
    { id: 'meeting-minutes', params: { title: '周会', participants: '张三' } },
    { id: 'api-mock', params: { method: 'GET', path: '/api/user' } },
    { id: 'countdown-timer', params: { target: '春节', date: '2027-01-29' } },
    { id: 'ppt-outline', params: { topic: '年度汇报', slides: 5 } },
    { id: 'tech-doc-template', params: { title: '新系统' } },
    { id: 'gantt-chart', params: { tasks: '[{"name":"A","start":"2026-01-01","duration":5}]', format: 'mermaid' } },
    { id: 'priority-matrix', params: { items: '[{"name":"A","urgent":true,"important":true}]' } }
  ];

  for (const t of tests) {
    const result = await test(t.id, t.params);
    try {
      const r = JSON.parse(result.response);
      if (r.success) console.log('✅', t.id);
      else console.log('❌', t.id, r.error);
    } catch(e) {
      console.log('❌', t.id, 'Parse error:', result.response.substring(0,50));
    }
  }
}

run();
