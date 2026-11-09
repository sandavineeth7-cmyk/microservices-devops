const http = require('http');

const PORT = process.env.PORT || 3003;
const VERSION = process.env.APP_VERSION || '1.0.0';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';

const orders = [
  { id: 1, userId: 1, productId: 1, quantity: 1 },
  { id: 2, userId: 2, productId: 3, quantity: 2 },
];

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function getJson(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
  if (!r.ok) throw new Error(`${url} returned ${r.status}`);
  return r.json();
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  console.log(`${new Date().toISOString()} ${req.method} ${url}`);

  if (url === '/health') {
    return send(res, 200, { service: 'order-service', status: 'ok', version: VERSION });
  }
  if (url === '/' || url === '/orders') {
    return send(res, 200, orders);
  }
  // Shows container-to-container connectivity: calls user and product services
  const m = url.match(/^\/orders\/(\d+)$/);
  if (m) {
    const order = orders.find((o) => o.id === Number(m[1]));
    if (!order) return send(res, 404, { error: 'order not found' });
    try {
      const [user, product] = await Promise.all([
        getJson(`${USER_SERVICE_URL}/users/${order.userId}`),
        getJson(`${PRODUCT_SERVICE_URL}/products/${order.productId}`),
      ]);
      return send(res, 200, { ...order, user, product });
    } catch (err) {
      console.error('dependency error:', err.message);
      return send(res, 502, { error: 'dependency unavailable', detail: err.message });
    }
  }
  return send(res, 404, { error: 'not found' });
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => console.log(`order-service listening on ${PORT}`));
}

module.exports = { server, orders };
