const http = require('http');

// Test 1: Get tools list
console.log('=== Test 1: Get Tools List ===');
const req1 = http.request({ hostname: 'localhost', port: 3000, path: '/api/tools', method: 'GET' }, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const tools = JSON.parse(data);
      console.log(`Total tools: ${tools.length}`);
      console.log('First tool:', tools[0]?.id, tools[0]?.name);
    } catch(e) {
      console.log('Response:', data.substring(0, 200));
    }
  });
});
req1.on('error', e => console.error('Error:', e.message));
req1.end();

// Test 2: JSON Formatter
setTimeout(() => {
  console.log('\n=== Test 2: JSON Formatter ===');
  const postData = JSON.stringify({ input: '{"name":"test","value":123}', action: 'format' });
  const req2 = http.request({ 
    hostname: 'localhost', 
    port: 3000, 
    path: '/api/exec/json-formatter', 
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  });
  req2.on('error', e => console.error('Error:', e.message));
  req2.write(postData);
  req2.end();
}, 500);

// Test 3: Password Generator
setTimeout(() => {
  console.log('\n=== Test 3: Password Generator ===');
  const postData = JSON.stringify({ length: 16, count: 3 });
  const req3 = http.request({ 
    hostname: 'localhost', 
    port: 3000, 
    path: '/api/exec/password-gen', 
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  });
  req3.on('error', e => console.error('Error:', e.message));
  req3.write(postData);
  req3.end();
}, 1000);

// Test 4: UUID Generator
setTimeout(() => {
  console.log('\n=== Test 4: UUID Generator ===');
  const postData = JSON.stringify({ count: 3 });
  const req4 = http.request({ 
    hostname: 'localhost', 
    port: 3000, 
    path: '/api/exec/uuid-generator', 
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  });
  req4.on('error', e => console.error('Error:', e.message));
  req4.write(postData);
  req4.end();
}, 1500);

// Test 5: Hash Calculator
setTimeout(() => {
  console.log('\n=== Test 5: Hash Calculator ===');
  const postData = JSON.stringify({ text: 'Hello World', algorithm: 'sha256' });
  const req5 = http.request({ 
    hostname: 'localhost', 
    port: 3000, 
    path: '/api/exec/hash-calculator', 
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  });
  req5.on('error', e => console.error('Error:', e.message));
  req5.write(postData);
  req5.end();
}, 2000);
