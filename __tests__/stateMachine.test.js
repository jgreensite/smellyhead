const stateMachine = require('../src/stateMachine');
const gameState = require('../src/gameState');
const Deck = require('../src/deck');

beforeEach(() => {
    // Reset gameState before each test
    gameState.players = [];
    gameState.currentState = 'waitingForPlayers';
});

describe('addPlayer', () => {
    test('adds a new player successfully', () => {
        const socketId = 'testSocketId';
        stateMachine.waitingForPlayers.addPlayer(socketId);
        expect(gameState.players).toHaveLength(1);
        expect(gameState.players[0].socketId).toEqual(socketId);
    });
    test('does not add a player if they already exist', () => {
        const socketId = 'testSocketId';
        stateMachine.waitingForPlayers.addPlayer(socketId);
        stateMachine.waitingForPlayers.addPlayer(socketId);
        expect(gameState.players).toHaveLength(1);
    });
    test('adds multiple players successfully', () => {
        const socketId1 = 'testSocketId1';
        const socketId2 = 'testSocketId2';
        stateMachine.waitingForPlayers.addPlayer(socketId1);
        stateMachine.waitingForPlayers.addPlayer(socketId2);
        expect(gameState.players).toHaveLength(2);
        expect(gameState.players[0].socketId).toEqual(socketId1);
        expect(gameState.players[1].socketId).toEqual(socketId2);
    });
});

describe('removePlayer', () => {
    test('removes a player successfully', () => {
        const socketId = 'testSocketId';
        stateMachine.waitingForPlayers.addPlayer(socketId);
        stateMachine.waitingForPlayers.removePlayer(socketId);
        expect(gameState.players).toHaveLength(0);
    });
    test('does not remove a player if they do not exist', () => {
        const socketId = 'testSocketId';
        stateMachine.waitingForPlayers.removePlayer(socketId);
        expect(gameState.players).toHaveLength(0);
    });
});

describe('listPlayers', () => {
    test('returns a list of all players', () => {
        const socketId1 = 'testSocketId1';
        const socketId2 = 'testSocketId2';
        stateMachine.waitingForPlayers.addPlayer(socketId1);
        stateMachine.waitingForPlayers.addPlayer(socketId2);
        const players = stateMachine.waitingForPlayers.listPlayers();
        expect(players).toHaveLength(2);
        expect(players[0].socketId).toEqual(socketId1);
        expect(players[1].socketId).toEqual(socketId2);
    });
});

describe('getPlayer', () => {
    test('returns a specific player', () => {
        const socketId = 'testSocketId';
        stateMachine.waitingForPlayers.addPlayer(socketId);
        const player = stateMachine.waitingForPlayers.getPlayer(socketId);
        expect(player.socketId).toEqual(socketId);
    });
    test('returns undefined if player does not exist', () => {
        const socketId = 'testSocketId';
        const player = stateMachine.waitingForPlayers.getPlayer(socketId);
        expect(player).toBeUndefined();
    });
});

describe('clearPlayers', () => {
    test('removes all players', () => {
        const socketId1 = 'testSocketId1';
        const socketId2 = 'testSocketId2';
        stateMachine.waitingForPlayers.addPlayer(socketId1);
        stateMachine.waitingForPlayers.addPlayer(socketId2);
        stateMachine.waitingForPlayers.clearPlayers();
        expect(gameState.players).toHaveLength(0);
    });
});

describe('startGame', () => {
    test('does not start the game if player does not exist', () => {
        const socketId = 'testSocketId';
        stateMachine.waitingForPlayers.startGame(socketId);
        expect(gameState.currentState).toEqual('waitingForPlayers');
    });

    test('does not start the game if not enough players', () => {
        const socketId1 = 'testSocketId1';
        stateMachine.waitingForPlayers.addPlayer(socketId1);
        stateMachine.waitingForPlayers.startGame(socketId1);
        expect(gameState.currentState).toEqual('waitingForPlayers');
    });

    test('starts the game if enough players and player exists', () => {
        const socketId1 = 'testSocketId1';
        const socketId2 = 'testSocketId2';
        stateMachine.waitingForPlayers.addPlayer(socketId1);
        stateMachine.waitingForPlayers.addPlayer(socketId2);
        stateMachine.waitingForPlayers.startGame(socketId1);
        expect(gameState.currentState).toEqual('setupGame');
    });
});

describe('initialize', () => {
    test('initializes the game correctly', () => {
        const socketId1 = 'testSocketId1';
        const socketId2 = 'testSocketId2';
        stateMachine.waitingForPlayers.addPlayer(socketId1);
        stateMachine.waitingForPlayers.addPlayer(socketId2);
        stateMachine.setupGame.initialize();
        expect(gameState.players[0].cardsFaceDown).toHaveLength(3);
        expect(gameState.players[0].cardsFaceUp).toHaveLength(3);
        expect(gameState.players[1].cardsFaceDown).toHaveLength(3);
        expect(gameState.players[1].cardsFaceUp).toHaveLength(3);
        expect(gameState.drawPile).toHaveLength(new Deck(1).cards.length - 12);
        expect(gameState.discardPile).toHaveLength(0);
        expect(gameState.graveyardPile).toHaveLength(0);
    });
});

describe('clearDiscardPile', () => {
    test('clears the discard pile correctly', () => {
        gameState.discardPile = [{ suit: 'hearts', value: 'A' }, { suit: 'clubs', value: 'K' }];
        stateMachine.gameInProgress.clearDiscardPile();
        expect(gameState.discardPile).toHaveLength(0);
        expect(gameState.graveyardPile).toHaveLength(2);
    });
});

describe('transition', () => {
    test('transitions to a new state', () => {
        stateMachine.transition('setupGame');
        expect(gameState.currentState).toEqual('setupGame');
    });
});


