const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const stateMachine = require('./src/stateMachine');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('joinGame', () => {
        stateMachine.waitingForPlayers.addPlayer(socket.id);
        // Emit event back to client if needed
    });

    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected.`);
        // Handle player disconnection...
    });

    socket.on('startGame', () => {
        stateMachine.waitingForPlayers.startGame(socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));