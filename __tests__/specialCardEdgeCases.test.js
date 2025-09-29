const gameState = require('../src/gameState');

beforeEach(() => {
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

describe('edge-case special card behaviors', () => {
    test('J on top of J does not recurse (no recursion for other Jacks)', () => {
        // According to gameRules, a J looks at the card below; if that card is also a J, there is no recursion
        // Set up a stack: [6, J, J] where bottom is 6, middle J, top J
        const six = { value: '6', suit: 'clubs', numericValue: 6 };
        const middleJ = { value: 'J', suit: 'spades', numericValue: 11 };
        const topJ = { value: 'J', suit: 'spades', numericValue: 11 };
        gameState.discardPile.push(six, middleJ, topJ);

        const gameRules = require('../src/gameRules');
        gameRules.postPlayPowers(topJ);

        // Because the J's secondCard is another J, the implementation chooses not to recurse.
        // Therefore even should remain null (not set true by the 6) and direction should be unchanged.
        expect(gameState.even).toBeNull();
        expect(gameState.direction).toBe(1);
    });

    test('J on top of 10 with multiple cards clears entire discard pile and moves them to graveyard', () => {
        // Create a larger discard pile and then place a 10 then a J on top
        const cards = [
            { value: '2', suit: 'hearts', numericValue: 2 },
            { value: '8', suit: 'clubs', numericValue: 8 },
            { value: '9', suit: 'diamonds', numericValue: 9 },
        ];
        const ten = { value: '10', suit: 'hearts', numericValue: 10 };
        const jack = { value: 'J', suit: 'hearts', numericValue: 11 };

        gameState.discardPile.push(...cards);
        gameState.discardPile.push(ten);
        gameState.discardPile.push(jack);

        const gameRules = require('../src/gameRules');
        gameRules.postPlayPowers(jack);

        // All cards should be moved to graveyard and discard pile cleared
        expect(gameState.discardPile).toHaveLength(0);
        // Graveyard must contain at least the number of moved cards
        expect(gameState.graveyardPile.length).toBeGreaterThanOrEqual(cards.length + 2);
        expect(gameState.direction).toBe(-1);
        expect(gameState.fastPlayActive).toBe(true);
    });
});
