// server.js
const WebSocket = require('ws');

const port = process.env.PORT || 9980;
const wss = new WebSocket.Server({ port });

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

    // Build the broadcast envelope
    const envelope = {
      type:            'broadcast_message',
      originalType:    data.originalType,              // "poll_response" | "custom_message"
      message:         data.message,                   // string
      timestamp:       new Date().toISOString(),       // e.g. "2024-01-01T12:00:00.000Z"
      session_id:      data.session_id                 // string
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

console.log(`WebSocket server listening on ws://localhost:${port}`);
