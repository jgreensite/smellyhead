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
    console.debug(`A user connected: ${socket.id}`);

    // Log event name for all events
    socket.on('event', (data) => {
        const eventName = data ? data.name : 'Unknown'; // If the event comes with a name property, use it; otherwise, log "Unknown"
        console.debug(`Received event: ${eventName} from user ${socket.id}`);
    });
    
    socket.on('addPlayer', () => {
        changeGameState.waitingForPlayers.addPlayer(socket.id);
        // Send confirmation back to client
        socket.emit('playerAdded', { socketId: socket.id });
    });

    socket.on('disconnect', () => {
        console.debug(`Player ${socket.id} disconnected.`);
        changeGameState.waitingForPlayers.removePlayer(socket.id);
    });

    socket.on('startGame', () => {
        const oldState = gameState.currentState;
        changeGameState.waitingForPlayers.startGame(socket.id);
        
        // If game actually entered setupGame state, notify all players
        if (oldState !== gameState.currentState && gameState.currentState === 'setupGame') {
            // Send initial setup state to all players
            gameState.players.forEach(player => {
                const playerState = getPlayerGameState(player.socketId);
                io.to(player.socketId).emit('setupStarted', playerState);
            });
        }
    });

    socket.on('swapCards', (data) => {
        const player = gameState.players.find(p => p.socketId === socket.id);
        if (!player) return;

        if (gameState.currentState !== 'setupGame') {
            socket.emit('playError', 'Cannot swap cards now.');
            return;
        }

        const result = changeGameState.setupGame.swapCards(player, data.handIndex, data.faceUpIndex);
        if (result.error) {
            socket.emit('playError', result.error);
        } else {
            broadcastGameState(); // Refresh UI for the player
        }
    });

    socket.on('setReady', () => {
        const player = gameState.players.find(p => p.socketId === socket.id);
        if (!player) return;

        if (gameState.currentState !== 'setupGame') return;

        const result = changeGameState.setupGame.setReady(player);
        if (result.allReady) {
            // Everyone is ready, game is now in progress
            gameState.players.forEach(p => {
                const playerState = getPlayerGameState(p.socketId);
                io.to(p.socketId).emit('gameStarted', playerState);
            });
            notifyTurns();
        } else {
            // Just update UI to show this player is ready (optional, but good for feedback)
            socket.emit('playMessage', 'You are ready. Waiting for others...');
        }
    });

    socket.on('playCard', (data) => {
        console.debug(`Player ${socket.id} wants to play card:`, data);
        
        const player = gameState.players.find(p => p.socketId === socket.id);
        if (!player) {
            socket.emit('error', 'Player not found');
            return;
        }
        
        // Use default 'hand' if not provided
        const cardType = data.cardType || 'hand';
        const cardIndices = data.cardIndices !== undefined ? data.cardIndices : data.cardIndex;
        
        if (cardIndices === undefined || cardIndices === null || (Array.isArray(cardIndices) && cardIndices.length === 0)) {
            socket.emit('error', 'Card index not provided');
            return;
        }

        // Prompt for suit if it's a Joker (and no suit was provided)
        // Check if any of the requested cards is a Joker
        let sourceArray = cardType === 'hand' ? player.hand : (cardType === 'faceUp' ? player.faceUpCards : player.faceDownCards);
        let indicesArray = Array.isArray(cardIndices) ? cardIndices : [cardIndices];

        let hasJoker = false;
        for (let idx of indicesArray) {
            if (sourceArray[idx] && sourceArray[idx].value === 'Joker') {
                hasJoker = true;
                if (!data.suit) {
                    // Tell client they need to pick a suit
                    socket.emit('playError', 'Please select a suit for the Joker.');
                    socket.emit('requestSuitSelection');
                    return;
                }
                // Apply the suit to the card before playing
                sourceArray[idx].suit = data.suit;
            }
        }

        // Attempt to play the card(s)
        const result = changeGameState.gameInProgress.prePlayCard(player, cardIndices, cardType);
        
        if (result && result.error) {
            socket.emit('playError', result.error);
            return;
        }

        if (result && result.blindPlayFailed) {
            socket.emit('playMessage', 'Blind play failed. Picked up the pile.');
        }
        
        // Broadcast updated game state to all players
        broadcastGameState();
        
        if (result && result.gameOver) {
            io.emit('gameOver', { winner: result.winner });
        } else {
            // Notify about turn changes
            notifyTurns();
        }
    });

    socket.on('drawCard', () => {
        console.debug(`Player ${socket.id} wants to draw a card`);
        
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

    socket.on('pickUpPile', () => {
        console.debug(`Player ${socket.id} wants to pick up the pile`);

        const player = gameState.players.find(p => p.socketId === socket.id);
        if (!player) {
            socket.emit('error', 'Player not found');
            return;
        }

        const result = changeGameState.gameInProgress.pickUpPile(player);

        if (result && result.error) {
            socket.emit('playError', result.error);
            return;
        }

        socket.emit('playMessage', 'You picked up the pile.');

        // Broadcast updated game state to all players
        broadcastGameState();

        // Notify about turn changes
        notifyTurns();
    });

    socket.on('playAgain', () => {
        console.debug(`Player ${socket.id} wants to play again`);

        // Only allow reset if game is over
        if (gameState.currentState === 'gameOver') {
            changeGameState.transition('waitingForPlayers', false);
            // Notify everyone to go back to lobby
            io.emit('resetGame');
        } else {
            socket.emit('error', 'Cannot play again unless the game is over.');
        }
    });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export server and io for tests
module.exports = { server, io, app };