// server.js
const http      = require('http');
const WebSocket = require('ws');

// Use the port Railway (or any PaaS) gives us,
// falling back to 9980 for local dev:
const port = process.env.PORT || 9980;

// 1) Create a plain HTTP server:
const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }
  // You can add more HTTP routes here if you need them
  res.writeHead(404);
  res.end();
});

// 2) Create the WebSocket.Server, telling it to use our HTTP server
const wss = new WebSocket.Server({ server, path: '/' });

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', raw => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error('Invalid JSON received:', raw);
      return;
    }

    const envelope = {
      type:         'broadcast_message',
      originalType: data.originalType,
      message:      data.message,
      timestamp:    new Date().toISOString(),
      session_id:   data.session_id
    };

    const payload = JSON.stringify(envelope);

    // Broadcast to all open clients
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

// 3) Start listening
server.listen(port, () => {
  console.log(`HTTP+WebSocket server listening on port ${port}`);
});
