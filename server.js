// server.js (bare WebSocket.Server version)
const WebSocket = require('ws');

// ❌ this hard-codes 9980—won’t work on Railway
// const wss = new WebSocket.Server({ port: 9980 });

// ✅ read Railway’s port, fallback to 9980 locally
const port = process.env.PORT || 9980;
const wss = new WebSocket.Server({ port });

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', raw => {
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
                type: 'broadcast_message',
                originalType: data.originalType,
                message: data.message || data.answer || '',
                timestamp: new Date().toISOString(),
                session_id: data.session_id
            };

            const payload = JSON.stringify(envelope);

            // Broadcast to all connected clients
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(payload);
                }
            });
        });
    });

    ws.on('close', () => console.log('Client disconnected'));
});

console.log(`WebSocket server listening on port ${port}`);