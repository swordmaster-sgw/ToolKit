const http = require('http');

// 获取 AI 可用工具列表
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/tools/ai',
  method: 'GET'
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const tools = JSON.parse(data);
    console.log('=== AI 可调用的工具 ===');
    console.log('总数:', tools.length);
    console.log('\n前5个工具:');
    tools.slice(0, 5).forEach(t => {
      console.log(`- ${t.function.name}: ${t.function.description.substring(0, 50)}...`);
    });
  });
});
req.on('error', e => console.log('Error:', e.message));
req.end();
