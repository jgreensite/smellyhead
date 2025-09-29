const { createGame, gameState } = require('../src/gameState');
const { clearDiscardPile } = require('../src/stateMachine');

describe('Game API extras', () => {
    test('createGame returns independent instances', () => {
        const g1 = createGame();
        const g2 = createGame();
        g1.players.push({ socketId: 'a' });
        expect(g1.players.length).toBe(1);
        expect(g2.players.length).toBe(0);
    });

    test('default singleton gameState is independent for tests when reset', () => {
        // clear players and discard pile
        gameState.players = [];
        gameState.discardPile = [];
        gameState.graveyardPile = [];

        // put some cards and clear
        gameState.discardPile.push({ value: '5' }, { value: '5' });
        clearDiscardPile();
        expect(gameState.discardPile.length).toBe(0);
        expect(gameState.graveyardPile.length).toBeGreaterThanOrEqual(2);
    });
});
