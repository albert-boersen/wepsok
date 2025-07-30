// server.js
const WebSocket = require('ws');

const port = process.env.PORT || 9980;
const wss = new WebSocket.Server({ port });

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', raw => {
    console.log('Received:', raw);

    let data;
    try {
      // Parse the incoming JSON
      data = JSON.parse(raw);
    } catch (err) {
      console.error('Invalid JSON received:', raw);
      return;
    }

    // Build your broadcast envelope
    const envelope = {
      type:         'broadcast_message',
      originalType: data.originalType,  // "poll_response" or "custom_message"
      message:      data.message || data.answer || '', 
      timestamp:    new Date().toISOString(),
      session_id:   data.session_id
    };

    // Serialize the envelope to a string
    const payload = JSON.stringify(envelope);

    // Broadcast the JSON string to all connected clients
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

console.log(`WebSocket server listening`);
