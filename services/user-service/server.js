const http = require('http');

const PORT = process.env.PORT || 3001;
const VERSION = process.env.APP_VERSION || '1.0.0';

const users = [
  { id: 1, name: 'Asha', email: 'asha@example.com' },
  { id: 2, name: 'Ravi', email: 'ravi@example.com' },
  { id: 3, name: 'Meena', email: 'meena@example.com' },
];

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  console.log(`${new Date().toISOString()} ${req.method} ${url}`);

  if (url === '/health') {
    return send(res, 200, { service: 'user-service', status: 'ok', version: VERSION });
  }
  if (url === '/' || url === '/users') {
    return send(res, 200, users);
  }
  const m = url.match(/^\/users\/(\d+)$/);
  if (m) {
    const user = users.find((u) => u.id === Number(m[1]));
    return user ? send(res, 200, user) : send(res, 404, { error: 'user not found' });
  }
  return send(res, 404, { error: 'not found' });
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => console.log(`user-service listening on ${PORT}`));
}

module.exports = { server, users };
