const gameState = require('../src/gameState');

beforeEach(() => {
    // Reset game state to a known baseline before each test
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

describe('special card behaviors', () => {
    test('10 clears the discard pile, toggles direction and activates fast play', () => {
        // Setup: put some cards in the discard pile and play a 10
        gameState.discardPile = [
            { value: '8', suit: 'hearts', numericValue: 8 },
            { value: '9', suit: 'clubs', numericValue: 9 },
        ];
        const tenCard = { value: '10', suit: 'spades', numericValue: 10 };
        // Simulate playing the 10
        gameState.discardPile.push(tenCard);
        // Call the post-play powers as the server would
        const gameRules = require('../src/gameRules');
        gameRules.postPlayPowers(tenCard);

        expect(gameState.discardPile).toHaveLength(0);
        expect(gameState.graveyardPile).toContainEqual(tenCard);
        expect(gameState.direction).toBe(-1);
        expect(gameState.fastPlayActive).toBe(true);
    });

    test('Joker sets suit requirement', () => {
        const joker = { value: 'Joker', suit: 'diamonds', numericValue: 0 };
        // Play the joker
        gameState.discardPile.push(joker);
        const gameRules = require('../src/gameRules');
        gameRules.postPlayPowers(joker);
        expect(gameState.suit).toBe('diamonds');
    });

    test('J copies effects of second card (6 sets even)', () => {
        // Second card is a 6, then a J on top should set even = true
        const secondCard = { value: '6', suit: 'clubs', numericValue: 6 };
        const jack = { value: 'J', suit: 'clubs', numericValue: 11 };
        gameState.discardPile.push(secondCard);
        gameState.discardPile.push(jack);
        const gameRules = require('../src/gameRules');
        gameRules.postPlayPowers(jack);
        expect(gameState.even).toBe(true);
    });

    test('four-of-a-kind clears the discard pile and activates fast play', () => {
        // Four cards of same value on top should clear the pile
        gameState.discardPile = [
            { value: '5', suit: 'hearts', numericValue: 5 },
            { value: '5', suit: 'clubs', numericValue: 5 },
            { value: '5', suit: 'diamonds', numericValue: 5 },
            { value: '5', suit: 'spades', numericValue: 5 },
        ];
        const gameRules = require('../src/gameRules');
        // Trigger the check by invoking postPlayPowers with the top card
        gameRules.postPlayPowers(gameState.discardPile[gameState.discardPile.length - 1]);
        expect(gameState.discardPile).toHaveLength(0);
        expect(gameState.graveyardPile.length).toBeGreaterThanOrEqual(4);
        expect(gameState.fastPlayActive).toBe(true);
    });

    test('6 sets even rule for next player', () => {
        const six = { value: '6', suit: 'hearts', numericValue: 6 };
        gameState.discardPile.push(six);
        const gameRules = require('../src/gameRules');
        gameRules.postPlayPowers(six);
        expect(gameState.even).toBe(true);
    });

    test('J on top of 10 copies 10 behavior (clears + direction change + fastPlay)', () => {
        // Put a 10 as the second card and J on top
        const ten = { value: '10', suit: 'hearts', numericValue: 10 };
        const jack = { value: 'J', suit: 'hearts', numericValue: 11 };
        gameState.discardPile.push(ten);
        gameState.discardPile.push(jack);
        const gameRules = require('../src/gameRules');
        gameRules.postPlayPowers(jack);
        // Expect the discard to be cleared by the copied 10 behavior
        expect(gameState.discardPile).toHaveLength(0);
        expect(gameState.graveyardPile).toContainEqual(jack);
        expect(gameState.direction).toBe(-1);
        expect(gameState.fastPlayActive).toBe(true);
    });

    test('nextPlayer respects direction and wraps around multiple players', () => {
        // Setup three players and check next player index changes with direction
        gameState.players = [ { socketId: 'p1' }, { socketId: 'p2' }, { socketId: 'p3' } ];
        gameState.currentPlayerIndex = 0; // p1's turn
        // Move forward
        gameState.nextPlayer();
        expect(gameState.currentPlayerIndex).toBe(1); // p2
        // Reverse direction and move (should go back to p1)
        gameState.direction = -1;
        gameState.nextPlayer();
        // 1 + (-1) => index 0 again
        expect(gameState.currentPlayerIndex).toBe(0);
        // Move backwards from 0 should wrap to last player
        gameState.nextPlayer();
        expect(gameState.currentPlayerIndex).toBe(2);
    });
});
