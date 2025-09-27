const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { changeGameState } = require('./src/stateMachine');
const { gameState } = require('./src/gameState');

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

// Helper function to get player-specific game state
function getPlayerGameState(socketId) {
    const player = gameState.players.find(p => p.socketId === socketId);
    if (!player) return null;
    
    const otherPlayers = gameState.players.filter(p => p.socketId !== socketId);
    
    return {
        drawPile: gameState.drawPile,
        discardPile: gameState.discardPile,
        graveyardPile: gameState.graveyardPile,
        myHand: player.hand,
        faceUpCards: player.faceUpCards,
        faceDownCards: player.faceDownCards,
        otherPlayersCards: otherPlayers.map(p => ({ 
            socketId: p.socketId, 
            handCount: p.hand.length,
            faceUpCards: p.faceUpCards,
            faceDownCount: p.faceDownCards.length
        })),
        playerCount: gameState.players.length,
        currentPlayer: gameState.getCurrentPlayer() ? gameState.getCurrentPlayer().socketId : null,
        currentRules: {
            even: gameState.even,
            lowerthan: gameState.lowerthan,
            suit: gameState.suit,
            fastPlayActive: gameState.fastPlayActive
        }
    };
}

function broadcastGameState() {
    gameState.players.forEach(player => {
        const playerState = getPlayerGameState(player.socketId);
        io.to(player.socketId).emit('updateUI', playerState);
    });
}

function notifyTurns() {
    const currentPlayer = gameState.getCurrentPlayer();
    if (!currentPlayer) return;
    
    gameState.players.forEach(player => {
        if (player.socketId === currentPlayer.socketId) {
            io.to(player.socketId).emit('yourTurn');
        } else {
            io.to(player.socketId).emit('notYourTurn', currentPlayer.socketId);
        }
    });
}

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Log event name for all events
    socket.on('event', (data) => {
        const eventName = data ? data.name : 'Unknown'; // If the event comes with a name property, use it; otherwise, log "Unknown"
        console.log(`Received event: ${eventName} from user ${socket.id}`);
    });
    
    socket.on('addPlayer', () => {
        changeGameState.waitingForPlayers.addPlayer(socket.id);
        // Send confirmation back to client
        socket.emit('playerAdded', { socketId: socket.id });
    });

    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected.`);
        changeGameState.waitingForPlayers.removePlayer(socket.id);
    });

    socket.on('startGame', () => {
        const oldState = gameState.currentState;
        changeGameState.waitingForPlayers.startGame(socket.id);
        
        // If game actually started, notify all players
        if (oldState !== gameState.currentState && gameState.currentState === 'gameInProgress') {
            // Send initial game state to all players
            gameState.players.forEach(player => {
                const playerState = getPlayerGameState(player.socketId);
                io.to(player.socketId).emit('gameStarted', playerState);
            });
            
            // Notify about initial turn
            notifyTurns();
        }
    });

    socket.on('playCard', (data) => {
        console.log(`Player ${socket.id} wants to play card:`, data);
        
        const player = gameState.players.find(p => p.socketId === socket.id);
        if (!player) {
            socket.emit('error', 'Player not found');
            return;
        }
        
        let card;
        if (data.cardType === 'hand') {
            card = player.hand[data.cardIndex];
        } else if (data.cardType === 'faceUp') {
            card = player.faceUpCards[data.cardIndex];
        }
        
        if (!card) {
            socket.emit('error', 'Card not found');
            return;
        }
        
        // Attempt to play the card
        changeGameState.gameInProgress.prePlayCard(player, card);
        
        // Broadcast updated game state to all players
        broadcastGameState();
        
        // Notify about turn changes
        notifyTurns();
    });

    socket.on('drawCard', () => {
        console.log(`Player ${socket.id} wants to draw a card`);
        
        const player = gameState.players.find(p => p.socketId === socket.id);
        if (!player) {
            socket.emit('error', 'Player not found');
            return;
        }
        
        // Draw a card if possible
        if (gameState.drawPile.length > 0) {
            const drawnCard = gameState.drawPile.pop();
            player.hand.push(drawnCard);
            
            // Broadcast updated game state
            broadcastGameState();
        } else {
            socket.emit('error', 'Draw pile is empty');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));