import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { networkInterfaces } from 'os';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    const io = new Server(server);

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

    server.listen(port, () => {
        console.log(`\n-------------------------------------------------------------`);
        console.log(`🚀 Next.js Ground Station Running!`);
        console.log(`-------------------------------------------------------------`);
        console.log(`📡 Local:           http://${hostname}:${port}`);

        // Find local IP
        const nets = networkInterfaces();
        for (const name of Object.keys(nets)) {
            const netInterface = nets[name];
            if (netInterface) {
                for (const net of netInterface) {
                    if (net.family === 'IPv4' && !net.internal) {
                        console.log(`📲 On Your Network: http://${net.address}:${port}`);
                    }
                }
            }
        }
        console.log(`-------------------------------------------------------------\n`);
    });
});
