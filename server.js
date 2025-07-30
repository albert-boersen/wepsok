// server.js
const WebSocket = require('ws');
const port = process.env.PORT || 9980;
const wss = new WebSocket.Server({ port });

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', message => {
    console.log('Received:', message);

    // Broadcast naar álle open clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    // OF: broadcast naar álle clients _behalve_ de afzender:
    // wss.clients.forEach(client => {
    //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //     client.send(message);
    //   }
    // });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log(`WebSocket server listening on ws://localhost:${port}`);
