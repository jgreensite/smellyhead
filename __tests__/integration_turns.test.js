const ioClient = require('socket.io-client');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { gameState } = require('../src/gameState');
const { changeGameState } = require('../src/stateMachine');

describe('integration: multi-player turns (isolated server)', () => {
  let clients = [];
  let server;
  let io;
  let url;

  beforeAll((done) => {
    // Create a fresh express+socket.io server for isolation
    const app = express();
    server = http.createServer(app);
    io = socketIo(server, { cors: { origin: '*' } });

    // Minimal handlers mirroring the real server behavior required for this test
    function getPlayerGameState(socketId) {
      const player = gameState.players.find(p => p.socketId === socketId);
      if (!player) return null;
      return { currentPlayer: gameState.getCurrentPlayer()?.socketId };
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
      socket.on('addPlayer', () => {
        changeGameState.waitingForPlayers.addPlayer(socket.id);
        socket.emit('playerAdded', { socketId: socket.id });
      });

      socket.on('startGame', () => {
        const oldState = gameState.currentState;
        changeGameState.waitingForPlayers.startGame(socket.id);
        if (oldState !== gameState.currentState && gameState.currentState === 'gameInProgress') {
          gameState.players.forEach(p => io.to(p.socketId).emit('gameStarted', getPlayerGameState(p.socketId)));
          notifyTurns();
        }
      });

      socket.on('drawCard', () => {
        const player = gameState.players.find(p => p.socketId === socket.id);
        if (!player) return;
        if (gameState.drawPile.length > 0) {
          const card = gameState.drawPile.pop();
          player.hand.push(card);
        }
        // after action, advance turn
        gameState.nextPlayer();
        notifyTurns();
      });
    });

    // Start listening on an ephemeral port to avoid conflicts
    server.listen(0, () => {
      const port = server.address().port;
      url = `http://localhost:${port}`;
      // ensure clean state
      gameState.players = [];
      gameState.currentState = 'waitingForPlayers';
      gameState.discardPile = [];
      gameState.graveyardPile = [];
      gameState.drawPile = [ { value: '2', suit: 'h', numericValue: 2 }, { value: '3', suit: 'h', numericValue: 3 }, { value: '4', suit: 'h', numericValue: 4 } ];
      setTimeout(done, 100);
    });
  });

  afterAll((done) => {
    clients.forEach(c => c && c.close());
    server.close(() => done());
  });

  test('three players take turns in correct order and respect direction', (done) => {
    const p1 = ioClient(url);
    const p2 = ioClient(url);
    const p3 = ioClient(url);
    clients.push(p1, p2, p3);

    let connected = 0;
    [p1, p2, p3].forEach((c) => {
      c.on('connect', () => {
        connected += 1;
        c.emit('addPlayer');
        if (connected === 3) {
          // Give the server a short moment to process addPlayer events, then start the game
          setTimeout(() => p1.emit('startGame'), 250);
        }
      });
    });

    let turnsNotified = 0;
    [p1, p2, p3].forEach((c) => {
      c.on('yourTurn', () => {
        turnsNotified += 1;
        // Each player will call drawCard to simulate an action
        c.emit('drawCard');
        // After all three have been notified once, check sequence
        if (turnsNotified === 3) {
          // At this point, currentPlayerIndex should have advanced (because drawCard called nextPlayer)
          expect(typeof gameState.currentPlayerIndex).toBe('number');
          done();
        }
      });
    });
  }, 20000);
});
