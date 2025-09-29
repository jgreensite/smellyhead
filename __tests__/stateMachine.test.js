const { changeGameState, clearDiscardPile } = require('../src/stateMachine');
const { gameState } = require('../src/gameState');
const Deck = require('../src/deck');

beforeEach(() => {
    // Reset gameState before each test
    gameState.players = [];
    gameState.currentState = 'waitingForPlayers';
    gameState.discardPile = [];
    gameState.graveyardPile = [];
    gameState.drawPile = [];
    gameState.currentPlayerIndex = 0;
    gameState.fastPlayActive = false;
    gameState.even = null;
    gameState.lowerthan = null;
    gameState.suit = '';
    gameState.direction = 1;
});

describe('addPlayer', () => {
    test('adds a new player successfully', () => {
        const socketId = 'testSocketId';
        changeGameState.waitingForPlayers.addPlayer(socketId);
        expect(gameState.players).toHaveLength(1);
        expect(gameState.players[0].socketId).toEqual(socketId);
    });
    test('does not add a player if they already exist', () => {
        const socketId = 'testSocketId';
        changeGameState.waitingForPlayers.addPlayer(socketId);
        changeGameState.waitingForPlayers.addPlayer(socketId);
        expect(gameState.players).toHaveLength(1);
    });
    test('adds multiple players successfully', () => {
        const socketId1 = 'testSocketId1';
        const socketId2 = 'testSocketId2';
        changeGameState.waitingForPlayers.addPlayer(socketId1);
        changeGameState.waitingForPlayers.addPlayer(socketId2);
        expect(gameState.players).toHaveLength(2);
        expect(gameState.players[0].socketId).toEqual(socketId1);
        expect(gameState.players[1].socketId).toEqual(socketId2);
    });
});

describe('removePlayer', () => {
    test('removes a player successfully', () => {
        const socketId = 'testSocketId';
        changeGameState.waitingForPlayers.addPlayer(socketId);
        changeGameState.waitingForPlayers.removePlayer(socketId);
        expect(gameState.players).toHaveLength(0);
    });
    test('does not remove a player if they do not exist', () => {
        const socketId = 'testSocketId';
        changeGameState.waitingForPlayers.removePlayer(socketId);
        expect(gameState.players).toHaveLength(0);
    });
});

describe('listPlayers', () => {
    test('returns a list of all players', () => {
        const socketId1 = 'testSocketId1';
        const socketId2 = 'testSocketId2';
        changeGameState.waitingForPlayers.addPlayer(socketId1);
        changeGameState.waitingForPlayers.addPlayer(socketId2);
                const players = changeGameState.waitingForPlayers.listPlayers();
                expect(players).toHaveLength(2);
                expect(players[0].socketId).toEqual(socketId1);
                expect(players[1].socketId).toEqual(socketId2);
    });
});

describe('getPlayer', () => {
    test('returns a specific player', () => {
        const socketId = 'testSocketId';
        changeGameState.waitingForPlayers.addPlayer(socketId);
        const player = changeGameState.waitingForPlayers.getPlayer(socketId);
        expect(player.socketId).toEqual(socketId);
    });
    test('returns undefined if player does not exist', () => {
        const socketId = 'testSocketId';
        const player = changeGameState.waitingForPlayers.getPlayer(socketId);
        expect(player).toBeUndefined();
    });
});

describe('clearPlayers', () => {
    test('removes all players', () => {
        const socketId1 = 'testSocketId1';
        const socketId2 = 'testSocketId2';
        changeGameState.waitingForPlayers.addPlayer(socketId1);
        changeGameState.waitingForPlayers.addPlayer(socketId2);
        changeGameState.waitingForPlayers.clearPlayers();
        expect(gameState.players).toHaveLength(0);
    });
});

describe('startGame', () => {
    test('does not start the game if player does not exist', () => {
        const socketId = 'testSocketId';
        changeGameState.waitingForPlayers.startGame(socketId);
        expect(gameState.currentState).toEqual('waitingForPlayers');
    });

    test('does not start the game if not enough players', () => {
        const socketId1 = 'testSocketId1';
        changeGameState.waitingForPlayers.addPlayer(socketId1);
        changeGameState.waitingForPlayers.startGame(socketId1);
        expect(gameState.currentState).toEqual('waitingForPlayers');
    });

    test('starts the game if enough players and player exists', () => {
        const socketId1 = 'testSocketId1';
        const socketId2 = 'testSocketId2';
        changeGameState.waitingForPlayers.addPlayer(socketId1);
        changeGameState.waitingForPlayers.addPlayer(socketId2);
        changeGameState.waitingForPlayers.startGame(socketId1);
        expect(gameState.currentState).toEqual('gameInProgress');
    });
});

describe('initialize', () => {
    test('initializes the game correctly', () => {
        const socketId1 = 'testSocketId1';
        const socketId2 = 'testSocketId2';
        changeGameState.waitingForPlayers.addPlayer(socketId1);
        changeGameState.waitingForPlayers.addPlayer(socketId2);
        changeGameState.transition('setupGame');
        expect(gameState.currentState).toEqual('gameInProgress');
        expect(gameState.players[0].faceDownCards).toHaveLength(3);
        expect(gameState.players[0].faceUpCards).toHaveLength(3);
        expect(gameState.players[0].hand).toHaveLength(3);
        expect(gameState.players[1].faceDownCards).toHaveLength(3);
        expect(gameState.players[1].faceUpCards).toHaveLength(3);
        expect(gameState.players[1].hand).toHaveLength(3);
        expect(gameState.drawPile).toHaveLength(new Deck(1).cards.length - 18);
        expect(gameState.discardPile).toHaveLength(0);
        expect(gameState.graveyardPile).toHaveLength(0);
    });
});

describe('playCard', () => {
    test('plays a card successfully', () => {
        changeGameState.waitingForPlayers.addPlayer('socket1');
        changeGameState.waitingForPlayers.addPlayer('socket2');
        changeGameState.waitingForPlayers.startGame('socket1');
        const player = gameState.players[0];
        const card = player.hand[0];
        changeGameState.gameInProgress.prePlayCard(player, card);
        expect(gameState.discardPile.includes(card)).toBe(true);
        expect(gameState.discardPile).toHaveLength(1);
        expect(player.hand.includes(card)).toBe(false);
    });

    test('does not play a card if it cannot be played', () => {
        const socketId = 'testSocketId';
        const card = { suit: 'hearts', value: '5', numericValue: 5 };
        const topCard = { suit: 'clubs', value: '9', numericValue: 9 };
        gameState.discardPile = [topCard];
        changeGameState.waitingForPlayers.addPlayer(socketId);
        const player = changeGameState.waitingForPlayers.getPlayer(socketId);
        player.hand = [card];
        changeGameState.gameInProgress.prePlayCard(player, card);
        expect(gameState.discardPile.includes(card)).toBe(false);
        expect(gameState.discardPile).toHaveLength(0);
        expect(player.hand.includes(topCard)).toBe(true);
        expect(player.hand.includes(card)).toBe(true);
        expect(player.hand).toHaveLength(2); // original card + picked up card
    });
});

describe('prePlayCard', () => {
    test('does not play a card if the player does not have it', () => {
        const socketId = 'testSocketId';
        const card = { suit: 'hearts', value: '5', numericValue: 5 };
        changeGameState.waitingForPlayers.addPlayer(socketId);
        const player = changeGameState.waitingForPlayers.getPlayer(socketId);
        player.hand = [];
        changeGameState.gameInProgress.prePlayCard(player, card);
        expect(gameState.discardPile.includes(card)).toBe(false);
        expect(player.hand.includes(card)).toBe(false);
    });
});

describe('postPlayCard', () => {
    test('handles an empty draw pile correctly', () => {
        const socketId = 'testSocketId';
        const card = { suit: 'hearts', value: '5', numericValue: 5 };
        changeGameState.waitingForPlayers.addPlayer(socketId);
        const player = changeGameState.waitingForPlayers.getPlayer(socketId);
        player.hand = [card];
        gameState.drawPile = [];
        changeGameState.gameInProgress.postPlayCard(player, card);
        expect(player.hand.includes(card)).toBe(true);
        expect(player.hand).toHaveLength(1);
        expect(gameState.drawPile).toHaveLength(0);
    });
});

describe('clearDiscardPile', () => {
    test('clears the discard pile correctly', () => {
        gameState.discardPile = [{ suit: 'hearts', value: 'A' }, { suit: 'clubs', value: 'K' }];
        clearDiscardPile();
        expect(gameState.discardPile).toHaveLength(0);
        expect(gameState.graveyardPile).toHaveLength(2);
    });
});

describe('clearDiscardPile', () => {
    test('handles an empty discard pile correctly', () => {
        gameState.discardPile = [];
        gameState.graveyardPile = [];
        clearDiscardPile();
        expect(gameState.discardPile).toHaveLength(0);
        expect(gameState.graveyardPile).toHaveLength(0);
    });
});

describe('transition', () => {
    test('transitions to a new state', () => {
        gameState.currentState = 'start';
        changeGameState.transition('waitingForPlayers');
        expect(gameState.currentState).toEqual('waitingForPlayers');
    });
});

describe('transition', () => {
    test('does not transition to an invalid state', () => {
        expect(() => {
            changeGameState.transition('invalidState');
        }).toThrow(Error);
    });
});