const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');

// Serve static files from current directory
app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('A client connected');

    // Handle telemetry updates from the host (PC connected to USB)
    socket.on('telemetry_data', (data) => {
        // Broadcast to all other clients (e.g. iPhone)
        socket.broadcast.emit('telemetry_update', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`\n-------------------------------------------------------------`);
    console.log(`🚀 Ground Station Server Running!`);
    console.log(`-------------------------------------------------------------`);
    console.log(`📡 Local:           http://localhost:${PORT}`);

    // Find local IP
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`📲 On Your Network: http://${net.address}:${PORT}`);
            }
        }
    }
    console.log(`-------------------------------------------------------------\n`);
});
