const http = require('http');

const PORT = process.env.PORT || 3002;
const VERSION = process.env.APP_VERSION || '1.0.0';

const products = [
  { id: 1, name: 'Laptop', price: 55000 },
  { id: 2, name: 'Keyboard', price: 1500 },
  { id: 3, name: 'Mouse', price: 700 },
];

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  console.log(`${new Date().toISOString()} ${req.method} ${url}`);

  if (url === '/health') {
    return send(res, 200, { service: 'product-service', status: 'ok', version: VERSION });
  }
  if (url === '/' || url === '/products') {
    return send(res, 200, products);
  }
  const m = url.match(/^\/products\/(\d+)$/);
  if (m) {
    const p = products.find((x) => x.id === Number(m[1]));
    return p ? send(res, 200, p) : send(res, 404, { error: 'product not found' });
  }
  return send(res, 404, { error: 'not found' });
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => console.log(`product-service listening on ${PORT}`));
}

module.exports = { server, products };
