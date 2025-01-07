import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { config } from 'dotenv';
import { Hono } from 'hono';
import { Server } from 'socket.io';

config();

const authMessages = [];
const app = new Hono();

const server = serve({
    fetch: app.fetch,
    port: process.env.PORT || 5050
})

app.use('*', serveStatic({ root: "./public" }));

const io = new Server(server, {
    pingInterval: 2000,
    pingTimeOut: 2000,
    connectionStateRecovery: {
        maxDisconnectionDuration: 5 * 60 * 1000,
        skipMiddlewares: true
    }
});


io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    if (socket.recovered) {
        console.log('SOCKET RECOVERED: ', socket.id);
    }

    socket.on('disconnect', (reason) => {
        console.log('a user disconnected', reason);
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

console.log('server running on http://localhost:5050');


// terminal command: 
//   node server.js
