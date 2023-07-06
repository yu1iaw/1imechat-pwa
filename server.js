const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const authMessages = [];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, + 'public/index.html'));
})

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('a user disconnected');
        const disconnectedUser = authMessages.find(user => user.id === socket.id);
        if (disconnectedUser) {
            io.emit('message', {
                author: disconnectedUser.author,
                date: new Date(),
                type: "logout"
            })

            const disconnectedUserIndex = authMessages.findIndex(user => user.id === socket.id);
            authMessages.splice(disconnectedUserIndex, 1);
        }
    })

    socket.on('message', (message) => {
        // console.log('message', message);
        if ('id' in message) authMessages.push(message);
        io.emit('message', message);
    })
})

http.listen(4000, () => {
    console.log(`listening on port http://localhost:4000`);
})

// terminal command: 
//   node server.js