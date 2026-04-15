const http = require('http');

const tools = [
  { id: 'json-formatter', params: { input: '{"a":1}', action: 'format' } },
  { id: 'base64-codec', params: { text: 'Hello', action: 'encode' } },
  { id: 'uuid-generator', params: { count: 2 } },
  { id: 'hash-calculator', params: { text: 'test', algorithm: 'md5' } },
  { id: 'password-gen', params: { length: 12, count: 2 } },
  { id: 'url-codec', params: { text: 'hello world', action: 'encode' } },
  { id: 'timestamp-converter', params: { value: '1700000000', action: 'toDate' } },
  { id: 'number-converter', params: { value: '255', fromBase: 10, toBase: 16 } },
  { id: 'color-converter', params: { color: '#FF5733' } },
  { id: 'cron-helper', params: { expression: '0 9 * * 1' } },
  { id: 'http-status', params: { code: '404' } },
  { id: 'regex-tester', params: { pattern: '\\d+', text: 'abc123def', flags: 'g' } },
  { id: 'text-process', params: { text: 'a\nb\na', action: 'dedup' } },
  { id: 'csv-json', params: { data: "name,age\nTom,25", action: 'csvToJson' } },
  { id: 'sql-formatter', params: { sql: 'select * from users where id=1' } },
  { id: 'log-analyzer', params: { log: 'INFO: start\nERROR: fail\nWARN: retry', level: 'error' } },
  { id: 'markdown-preview', params: { content: '# Hello\n**bold**' } },
  { id: 'cmd-cheatsheet', params: { command: 'push', category: 'git' } },
  { id: 'env-diff', params: { env1: 'DB_HOST=localhost\nPORT=3000', env2: 'DB_HOST=remote\nPORT=3000' } },
  // 修复这些工具的参数
  { id: 'data-masking', params: { data: '手机:13812345678, 邮箱:test@email.com', type: 'all' } },
  { id: 'bug-report', params: { title: '登录失败', description: '无法登录系统', steps: '1.打开页面\n2.输入账号\n3.点击登录', severity: 'high' } },
  { id: 'weekly-report', params: { thisWeek: '- 完成用户模块\n- 修复Bug', nextWeek: '- 开发订单模块', highlights: '- 性能提升50%' } },
  { id: 'standup-helper', params: { yesterday: '- 完成代码审查', today: '- 编写单元测试', blockers: '无' } },
  { id: 'meeting-minutes', params: { title: '项目周会', participants: '张三,李四', decisions: '决定使用方案A', actions: '张三:周五前完成设计' } },
  { id: 'api-mock', params: { method: 'GET', path: '/api/user', description: '获取用户信息' } },
  { id: 'countdown-timer', params: { target: '春节', date: '2027-01-29' } },
  { id: 'ppt-outline', params: { topic: '年度总结汇报', slides: 5 } },
  { id: 'tech-doc-template', params: { title: '用户系统重构', background: '当前系统性能不足' } },
  { id: 'gantt-chart', params: { tasks: '[{"name":"需求分析","start":"2026-01-01","duration":5},{"name":"开发","start":"2026-01-06","duration":10}]', format: 'mermaid' } },
  { id: 'priority-matrix', params: { items: '[{"name":"任务A","urgent":true,"important":true},{"name":"任务B","urgent":false,"important":true},{"name":"任务C","urgent":true,"important":false}]' } }
];

let completed = 0;
let successCount = 0;
let failCount = 0;

tools.forEach((tool, index) => {
  setTimeout(() => {
    const postData = JSON.stringify(tool.params);
    const req = http.request({ 
      hostname: 'localhost', 
      port: 3000, 
      path: `/api/exec/${tool.id}`, 
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        completed++;
        try {
          const result = JSON.parse(data);
          if (result.success) {
            successCount++;
            console.log(`✅ ${tool.id}`);
          } else {
            failCount++;
            console.log(`❌ ${tool.id}: ${result.error}`);
          }
        } catch(e) {
          failCount++;
          console.log(`❌ ${tool.id}: Parse error - ${data.substring(0,100)}`);
        }
        if (completed === tools.length) {
          console.log(`\n==========\n总计: ${successCount}/${tools.length} 成功`);
        }
      });
    });
    req.on('error', e => { completed++; failCount++; console.log(`❌ ${tool.id}: ${e.message}`); });
    req.write(postData);
    req.end();
  }, index * 80);
});
