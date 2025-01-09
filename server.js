import express from 'express';
import { createServer } from "http";
import path from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';


const authMessages = [];
const app = express();
const server = createServer(app);
const isDev = process.env.NODE_ENV !== "production";
const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);


(async () => {
    if (isDev) {
        const vite = await createViteServer({ server: { middlewareMode: true } });
        app.use(vite.middlewares);
    } else {
        const staticPath = path.resolve(__dirname, 'dist');
        app.use(express.static(staticPath));
        app.get('/', (req, res) => {
            res.sendFile(path.resolve(staticPath, 'index.html'));
        })
    }
})()

app.get('/api', (req, res) => {
    res.json({ hello: 1 })
})

const io = new Server(server, {
    pingInterval: 2000,
    pingTimeOut: 2000,
    connectionStateRecovery: {
        maxDisconnectionDuration: 5 * 60 * 1000,
        skipMiddlewares: true
    }
});


io.on('connection', (socket) => {
    // console.log('a user connected', socket.id);

    if (socket.recovered) {
        // console.log('recovered: ', socket.id);
    }

    socket.on('disconnect', (reason) => {
        // console.log('a user disconnected', reason);
        if (reason === 'transport close') {
            const disconnectedUser = authMessages.find(user => user.id === socket.id);
            if (disconnectedUser) {
                io.emit('message', {
                    author: disconnectedUser.author,
                    date: new Date(),
                    type: "logout",
                    infoTotal: authMessages.length - 1
                })

                const disconnectedUserIndex = authMessages.findIndex(user => user.id === socket.id);
                disconnectedUserIndex > -1 && authMessages.splice(disconnectedUserIndex, 1);
            }
        }
    })

    socket.on('message', (message) => {
        if ('id' in message) authMessages.push(message);
        const msg = { ...message, infoTotal: authMessages.length };
        io.emit('message', msg);
    })
})


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`server running on port:${PORT}`))