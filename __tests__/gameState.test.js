const { createGame, gameState } = require('../src/gameState');
const Player = require('../src/player');

describe('Game class', () => {
    let game;

    beforeEach(() => {
        game = createGame();
    });

    test('creates new game with default values', () => {
        expect(game.players).toEqual([]);
        expect(game.drawPile).toEqual([]);
        expect(game.discardPile).toEqual([]);
        expect(game.graveyardPile).toEqual([]);
        expect(game.currentState).toBe('waitingForPlayers');
        expect(game.suit).toBe('');
        expect(game.lowerthan).toBe(false);
        expect(game.direction).toBe(1);
        expect(game.even).toBe(false);
        expect(game.currentPlayerIndex).toBe(0);
        expect(game.fastPlayActive).toBe(false);
    });

    test('getCurrentPlayer returns null when no players', () => {
        expect(game.getCurrentPlayer()).toBe(null);
    });

    test('getCurrentPlayer returns correct player', () => {
        const player1 = new Player('socket1');
        const player2 = new Player('socket2');
        game.players = [player1, player2];
        game.currentPlayerIndex = 1;

        expect(game.getCurrentPlayer()).toBe(player2);
    });

    test('nextPlayer advances index forward when direction is 1', () => {
        const player1 = new Player('socket1');
        const player2 = new Player('socket2');
        const player3 = new Player('socket3');
        game.players = [player1, player2, player3];
        game.currentPlayerIndex = 0;
        game.direction = 1;

        game.nextPlayer();
        expect(game.currentPlayerIndex).toBe(1);

        game.nextPlayer();
        expect(game.currentPlayerIndex).toBe(2);

        game.nextPlayer(); // Should wrap around
        expect(game.currentPlayerIndex).toBe(0);
    });

    test('nextPlayer advances index backward when direction is -1', () => {
        const player1 = new Player('socket1');
        const player2 = new Player('socket2');
        const player3 = new Player('socket3');
        game.players = [player1, player2, player3];
        game.currentPlayerIndex = 2;
        game.direction = -1;

        game.nextPlayer();
        expect(game.currentPlayerIndex).toBe(1);

        game.nextPlayer();
        expect(game.currentPlayerIndex).toBe(0);

        game.nextPlayer(); // Should wrap around
        expect(game.currentPlayerIndex).toBe(2);
    });

    test('nextPlayer handles empty player list', () => {
        game.players = [];
        game.currentPlayerIndex = 0;

        game.nextPlayer(); // Should not throw
        expect(game.currentPlayerIndex).toBe(0);
    });

    test('isPlayerTurn returns true for current player', () => {
        const player1 = new Player('socket1');
        const player2 = new Player('socket2');
        game.players = [player1, player2];
        game.currentPlayerIndex = 0;

        expect(game.isPlayerTurn('socket1')).toBe(true);
        expect(game.isPlayerTurn('socket2')).toBe(false);
    });

    test('isPlayerTurn returns false when no current player', () => {
        game.players = [];

        expect(game.isPlayerTurn('socket1')).toBe(false);
    });

    test('isPlayerTurn returns false for unknown player', () => {
        const player1 = new Player('socket1');
        game.players = [player1];
        game.currentPlayerIndex = 0;

        expect(game.isPlayerTurn('unknown')).toBe(false);
    });
});

describe('gameState singleton', () => {
    test('is instance of Game class', () => {
        expect(gameState).toBeDefined();
        expect(typeof gameState.getCurrentPlayer).toBe('function');
        expect(typeof gameState.nextPlayer).toBe('function');
        expect(typeof gameState.isPlayerTurn).toBe('function');
    });

    test('maintains state between imports', () => {
        gameState.testProperty = 'test123';
        const { gameState: gameState2 } = require('../src/gameState');
        expect(gameState2.testProperty).toBe('test123');
        delete gameState.testProperty; // cleanup
    });
});

describe('createGame factory', () => {
    test('creates independent game instances', () => {
        const game1 = createGame();
        const game2 = createGame();

        game1.testProperty = 'game1';
        game2.testProperty = 'game2';

        expect(game1.testProperty).toBe('game1');
        expect(game2.testProperty).toBe('game2');
        expect(game1 !== game2).toBe(true);
    });

    test('each game has independent state', () => {
        const game1 = createGame();
        const game2 = createGame();

        const player1 = new Player('socket1');
        const player2 = new Player('socket2');

        game1.players = [player1];
        game2.players = [player2];

        expect(game1.players).toHaveLength(1);
        expect(game2.players).toHaveLength(1);
        expect(game1.players[0]).toBe(player1);
        expect(game2.players[0]).toBe(player2);
    });
});