const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { changeGameState } = require('./src/stateMachine');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Enable CORS for all routes
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Update this to the allowed origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, SET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  });

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Log event name for all events
    socket.on('event', (data) => {
        const eventName = data ? data.name : 'Unknown'; // If the event comes with a name property, use it; otherwise, log "Unknown"
        console.log(`Received event: ${eventName} from user ${socket.id}`);
    });
    
    socket.on('addPlayer', () => {
        changeGameState.waitingForPlayers.addPlayer(socket.id);
        // Emit event back to client if needed
    });

    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected.`);
        // Handle player disconnection...
    });

    socket.on('startGame', () => {
        changeGameState.waitingForPlayers.startGame(socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));