const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { changeGameState } = require('./src/stateMachine');
const { gameState } = require('./src/gameState');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, SET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
});

app.use(express.static('public'));

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
        otherPlayersCards: otherPlayers.map(p => ({ socketId: p.socketId, handCount: p.hand.length, faceUpCards: p.faceUpCards, faceDownCount: p.faceDownCards.length })),
        playerCount: gameState.players.length,
        currentPlayer: gameState.getCurrentPlayer() ? gameState.getCurrentPlayer().socketId : null,
        currentRules: { even: gameState.even, lowerthan: gameState.lowerthan, suit: gameState.suit, fastPlayActive: gameState.fastPlayActive }
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
        if (player.socketId === currentPlayer.socketId) io.to(player.socketId).emit('yourTurn');
        else io.to(player.socketId).emit('notYourTurn', currentPlayer.socketId);
    });
}

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);
    socket.on('event', (data) => {
        const eventName = data ? data.name : 'Unknown';
        console.log(`Received event: ${eventName} from user ${socket.id}`);
    });

    socket.on('addPlayer', () => {
        changeGameState.waitingForPlayers.addPlayer(socket.id);
        socket.emit('playerAdded', { socketId: socket.id });
    });

    socket.on('disconnect', () => {
        changeGameState.waitingForPlayers.removePlayer(socket.id);
    });

    socket.on('startGame', () => {
        const oldState = gameState.currentState;
        changeGameState.waitingForPlayers.startGame(socket.id);
        if (oldState !== gameState.currentState && gameState.currentState === 'gameInProgress') {
            gameState.players.forEach(player => io.to(player.socketId).emit('gameStarted', getPlayerGameState(player.socketId)));
            notifyTurns();
        }
    });

    socket.on('playCard', (data) => {
        const player = gameState.players.find(p => p.socketId === socket.id);
        if (!player) { socket.emit('error', 'Player not found'); return; }
        let card = (data.cardType === 'hand') ? player.hand[data.cardIndex] : player.faceUpCards[data.cardIndex];
        if (!card) { socket.emit('error', 'Card not found'); return; }
        changeGameState.gameInProgress.prePlayCard(player, card);
        broadcastGameState();
        notifyTurns();
    });

    socket.on('drawCard', () => {
        const player = gameState.players.find(p => p.socketId === socket.id);
        if (!player) { socket.emit('error', 'Player not found'); return; }
        if (gameState.drawPile.length > 0) { player.hand.push(gameState.drawPile.pop()); broadcastGameState(); }
        else socket.emit('error', 'Draw pile is empty');
    });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`)).on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') { console.warn(`Port ${PORT} already in use; trying ephemeral port for tests.`); server.listen(0, () => console.log(`Server running on ephemeral port ${server.address().port}`)); }
        else if (err) throw err;
    });
}

module.exports = { server, io, app };

// Wrap server.listen so callers (tests) can call it and we gracefully fall back on EADDRINUSE
// to an ephemeral port and still invoke the callback.
{
    const originalListen = server.listen.bind(server);
    server.listen = function wrappedListen(port, cb) {
        const onError = (err) => {
            if (err && err.code === 'EADDRINUSE') { server.off('error', onError); originalListen(0, cb); }
            else { server.off('error', onError); throw err; }
        };
        server.on('error', onError);
        return originalListen(port, cb);
    };
}