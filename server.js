// server.js
const http      = require('http');
const WebSocket = require('ws');

const port = process.env.PORT || 9980;

// 1) Plain HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }
  res.writeHead(404);
  res.end();
});

// 2) Attach WebSocket server to the same HTTP server
const wss = new WebSocket.Server({ server, path: '/' });

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', raw => {
    console.log('Received:', raw);
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error('Invalid JSON:', raw);
      return;
    }

    // Build the broadcast envelope
    const envelope = {
      type:         'broadcast_message',
      originalType: data.originalType,
      message:      data.message || data.answer || '',
      timestamp:    new Date().toISOString(),
      session_id:   data.session_id
    };

    const payload = JSON.stringify(envelope);

    // Broadcast to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// 3) Start listening on the dynamic port
server.listen(port, () => {
  console.log(`HTTP+WebSocket server listening on port ${port}`);
});
