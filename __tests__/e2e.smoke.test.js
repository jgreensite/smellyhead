const ioClient = require('socket.io-client');
const { server } = require('../server');
const { gameState } = require('../src/gameState');

const URL = 'http://localhost:3000';

describe('E2E smoke', () => {
  let client1, client2;

  beforeAll((done) => {
    // ensure clean state
    gameState.players = [];
    // Start server on default port for E2E test
    const PORT = process.env.PORT || 3000;
    if (!server.listening) {
      server.listen(PORT, () => setTimeout(done, 150));
    } else {
      setTimeout(done, 150);
    }
  });

  afterAll((done) => {
    client1 && client1.close();
    client2 && client2.close();
    server.close(() => done());
  });

  test('two clients can join and start a game', (done) => {
    let startedCount = 0;

    client1 = ioClient(URL);
    client2 = ioClient(URL);

    client1.on('connect', () => {
      client1.emit('addPlayer');
    });
    client2.on('connect', () => {
      client2.emit('addPlayer');
    });

    function onGameStarted() {
      startedCount += 1;
      if (startedCount === 2) {
        // both clients received game started
        done();
      }
    }

    client1.on('gameStarted', (state) => {
      expect(state).toBeDefined();
      onGameStarted();
    });
    client2.on('gameStarted', (state) => {
      expect(state).toBeDefined();
      onGameStarted();
    });

    // Wait briefly for both to register, then client1 requests startGame
    setTimeout(() => {
      client1.emit('startGame');
    }, 300);
  }, 10000);
});
