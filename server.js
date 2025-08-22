// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let stream;

wss.on('connection', ws => {
    // If a new client connects, send them the latest video data
    if (stream) {
        ws.send(stream);
    }
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.post('/stream', (req, res) => {
    let buffer = [];
    req.on('data', chunk => {
        buffer.push(chunk);
    });
    req.on('end', () => {
        stream = Buffer.concat(buffer);
        // Broadcast the new video data to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(stream);
            }
        });
        res.sendStatus(200);
    });
});

server.listen(8080, () => {
    console.log('Server started on port 8080');
});
