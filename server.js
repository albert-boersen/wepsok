// server.js
const http      = require('http');
const WebSocket = require('ws');
const os        = require('os');

const port = process.env.PORT || 9980;

// 1) Plain HTTP server for health checks and logging
const server = http.createServer((req, res) => {
  console.log(`HTTP ${req.method} ${req.url}`);
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }
  res.writeHead(404);
  res.end();
});

// 2) Attach a WebSocket server on top of the same HTTP server
const wss = new WebSocket.Server({ server, path: '/' });

wss.on('connection', ws => {
  console.log('WS: client connected');

  ws.on('message', raw => {
    console.log('WS Received:', raw);
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error('WS Invalid JSON:', raw);
      return;
    }

    const envelope = {
      type:         'broadcast_message',
      originalType: data.originalType,
      message:      data.message || data.answer || '',
      timestamp:    new Date().toISOString(),
      session_id:   data.session_id
    };

    const payload = JSON.stringify(envelope);

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  });

  ws.on('close', () => console.log('WS: client disconnected'));
});

// 3) Listen on all interfaces so Railway’s load-balancer can reach us
server.listen(port, '0.0.0.0', () => {
  console.log(`HTTP+WS listening on 0.0.0.0:${port}`);
  // also print any local IPs for debugging
  for (let iface of Object.values(os.networkInterfaces()).flat()) {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(` → ws://${iface.address}:${port}/`);
    }
  }
});
