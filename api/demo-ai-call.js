const http = require('http');

// 测试：让 AI 调用工具
function callTool(toolName, params) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(params);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/exec/' + toolName,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let result = '';
      res.on('data', chunk => result += chunk);
      res.on('end', () => resolve(JSON.parse(result)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function demo() {
  console.log('=== AI 调用工具演示 ===\n');

  // 1. 格式化 JSON
  console.log('1. 调用 json-formatter 格式化 JSON:');
  const r1 = await callTool('json-formatter', { input: '{"name":"test","value":123}', action: 'format' });
  console.log(r1.result);

  // 2. 生成密码
  console.log('\n2. 调用 password-gen 生成密码:');
  const r2 = await callTool('password-gen', { length: 16, count: 3 });
  console.log(r2.result);

  // 3. Base64 编码
  console.log('\n3. 调用 base64-codec 编码:');
  const r3 = await callTool('base64-codec', { text: 'Hello World', action: 'encode' });
  console.log(r3.result);

  // 4. UUID 生成
  console.log('\n4. 调用 uuid-generator:');
  const r4 = await callTool('uuid-generator', { count: 3 });
  console.log(r4.result);

  // 5. 生成周报
  console.log('\n5. 调用 weekly-report 生成周报:');
  const r5 = await callTool('weekly-report', { 
    thisWeek: '- 完成用户模块开发\n- 修复5个Bug',
    nextWeek: '- 开发订单模块',
    highlights: '- 性能提升50%'
  });
  console.log(r5.result);

  console.log('\n=== 演示完成 ===');
}

demo().catch(console.error);
