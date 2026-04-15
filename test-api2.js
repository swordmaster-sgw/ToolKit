const http = require('http');

// Test 1: Get tools list
console.log('=== Test 1: Get Tools ===');
const req1 = http.request({ hostname: 'localhost', port: 3000, path: '/api/tools', method: 'GET' }, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const tools = JSON.parse(data);
      console.log(`Total tools: ${tools.length}`);
      console.log('Sample:', tools.slice(0,3).map(t => t.id));
    } catch(e) { console.log('Error:', e.message); }
  });
});
req1.on('error', e => console.error('Error:', e.message));
req1.end();

// Test: Regex Tester
setTimeout(() => {
  console.log('\n=== Test: Regex Tester ===');
  const postData = JSON.stringify({ pattern: '\\d+', text: 'abc 123 def 456', flags: 'g' });
  const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/exec/regex-tester', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  });
  req.write(postData); req.end();
}, 500);

// Test: CSV to JSON
setTimeout(() => {
  console.log('\n=== Test: CSV to JSON ===');
  const postData = JSON.stringify({ data: "name,age\nTom,25\nJerry,30", action: "csvToJson" });
  const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/exec/csv-json', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  });
  req.write(postData); req.end();
}, 1000);

// Test: Data Masking
setTimeout(() => {
  console.log('\n=== Test: Data Masking ===');
  const postData = JSON.stringify({ data: "手机:13812345678, 邮箱:test@email.com, 身份证:110101199001011234", type: "all" });
  const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/exec/data-masking', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  });
  req.write(postData); req.end();
}, 1500);

// Test: SQL Formatter
setTimeout(() => {
  console.log('\n=== Test: SQL Formatter ===');
  const postData = JSON.stringify({ sql: "select name,age from users where id=1 and status='active'", action: "format" });
  const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/exec/sql-formatter', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  });
  req.write(postData); req.end();
}, 2000);

// Test: Log Analyzer
setTimeout(() => {
  console.log('\n=== Test: Log Analyzer ===');
  const postData = JSON.stringify({ log: "INFO: started\nERROR: connection failed\nWARN: retrying\nDEBUG: details\nERROR: timeout", level: "error" });
  const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/exec/log-analyzer', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  });
  req.write(postData); req.end();
}, 2500);

// Test: Text Diff
setTimeout(() => {
  console.log('\n=== Test: Text Diff ===');
  const postData = JSON.stringify({ oldText: "line1\nline2\nline3", newText: "line1\nline2 modified\nline4" });
  const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/exec/text-diff', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  });
  req.write(postData); req.end();
}, 3000);
