// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 9980 });

wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('message', msg => {
    console.log('Received:', msg);
    ws.send(`Echo: ${msg}`);

    let data;
    try {
        data = JSON.parse(msg);
    } catch {
        console.error('invalid JSON');
        return;
    }

    console.log(data);

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
  ws.on('close', () => console.log('Client disconnected'));
});

console.log('WebSocket server listening');
