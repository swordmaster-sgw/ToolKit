const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/exec/data-masking',
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json'
  }
}, res => {
  let r = '';
  res.on('data', c => r += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', r);
  });
});

req.on('error', e => console.log('Error:', e.message));

req.write(JSON.stringify({ data: '手机13812345678', type: 'all' }));
req.end();
