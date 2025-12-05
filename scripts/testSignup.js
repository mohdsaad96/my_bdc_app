const http = require('http');

const data = JSON.stringify({ fullName: 'Test User Script', email: 'testscript@example.com', password: 'password123' });

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log('BODY', body);
  });
});

req.on('error', (err) => console.error('REQUEST ERROR', err));
req.write(data);
req.end();
