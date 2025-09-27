const gameRules = require('../src/gameRules');
const { gameState } = require('../src/gameState');
const Player = require('../src/player');

beforeEach(() => {
    // Reset gameState before each test
    gameState.players = [];
    gameState.currentState = 'gameInProgress';
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

describe('canPlayCard', () => {
    test('allows any card on empty discard pile', () => {
        const player = new Player('test');
        const card = { suit: 'hearts', value: '5', numericValue: 5 };
        
        gameState.discardPile = [];
        expect(gameRules.canPlayCard(player, card)).toBe(true);
    });

    test('enforces even card requirement', () => {
        const player = new Player('test');
        const evenCard = { suit: 'hearts', value: '4', numericValue: 4 };
        const oddCard = { suit: 'spades', value: '5', numericValue: 5 };
        const topCard = { suit: 'clubs', value: '6', numericValue: 6 };
        
        gameState.discardPile = [topCard];
        gameState.even = true;
        
        expect(gameRules.canPlayCard(player, evenCard)).toBe(true);
        expect(gameRules.canPlayCard(player, oddCard)).toBe(false);
    });

    test('enforces odd card requirement', () => {
        const player = new Player('test');
        const evenCard = { suit: 'hearts', value: '4', numericValue: 4 };
        const oddCard = { suit: 'spades', value: '5', numericValue: 5 };
        const topCard = { suit: 'clubs', value: '6', numericValue: 6 };
        
        gameState.discardPile = [topCard];
        gameState.even = false;
        
        expect(gameRules.canPlayCard(player, evenCard)).toBe(false);
        expect(gameRules.canPlayCard(player, oddCard)).toBe(true);
    });

    test('enforces lower than 7 requirement', () => {
        const player = new Player('test');
        const lowCard = { suit: 'hearts', value: '3', numericValue: 3 };
        const highCard = { suit: 'spades', value: '9', numericValue: 9 };
        const sevenCard = { suit: 'clubs', value: '7', numericValue: 7 };
        const topCard = { suit: 'diamonds', value: '7', numericValue: 7 };
        
        gameState.discardPile = [topCard];
        gameState.lowerthan = true;
        
        expect(gameRules.canPlayCard(player, lowCard)).toBe(true);
        expect(gameRules.canPlayCard(player, highCard)).toBe(false);
        expect(gameRules.canPlayCard(player, sevenCard)).toBe(false); // 7 is not lower than 7
    });

    test('enforces suit requirement', () => {
        const player = new Player('test');
        const heartsCard = { suit: 'hearts', value: '5', numericValue: 5 };
        const spadesCard = { suit: 'spades', value: '5', numericValue: 5 };
        const topCard = { suit: 'clubs', value: '9', numericValue: 9 };
        
        gameState.discardPile = [topCard];
        gameState.suit = 'hearts';
        
        expect(gameRules.canPlayCard(player, heartsCard)).toBe(true);
        expect(gameRules.canPlayCard(player, spadesCard)).toBe(false);
    });

    test('default rule: card must be higher than or equal to top card', () => {
        const player = new Player('test');
        const lowerCard = { suit: 'hearts', value: '3', numericValue: 3 };
        const equalCard = { suit: 'spades', value: '5', numericValue: 5 };
        const higherCard = { suit: 'clubs', value: '8', numericValue: 8 };
        const topCard = { suit: 'diamonds', value: '5', numericValue: 5 };
        
        gameState.discardPile = [topCard];
        gameState.even = null;
        gameState.lowerthan = null;
        gameState.suit = '';
        
        expect(gameRules.canPlayCard(player, lowerCard)).toBe(false);
        expect(gameRules.canPlayCard(player, equalCard)).toBe(true);
        expect(gameRules.canPlayCard(player, higherCard)).toBe(true);
    });
});

describe('postPlayPowers', () => {
    test('resets rule flags to defaults', () => {
        const card = { suit: 'hearts', value: '2', numericValue: 2 };
        gameState.discardPile = [card];
        gameState.even = true;
        gameState.lowerthan = true;
        gameState.suit = 'hearts';
        gameState.fastPlayActive = true;
        
        gameRules.postPlayPowers(card);
        
        expect(gameState.even).toBe(null);
        expect(gameState.lowerthan).toBe(null);
        expect(gameState.suit).toBe('');
        expect(gameState.fastPlayActive).toBe(false);
    });

    test('4 changes direction', () => {
        const card = { suit: 'hearts', value: '4', numericValue: 4 };
        gameState.discardPile = [card];
        gameState.direction = 1;
        
        gameRules.postPlayPowers(card);
        
        expect(gameState.direction).toBe(-1);
    });

    test('6 requires even card next', () => {
        const card = { suit: 'hearts', value: '6', numericValue: 6 };
        gameState.discardPile = [card];
        
        gameRules.postPlayPowers(card);
        
        expect(gameState.even).toBe(true);
    });

    test('7 requires lower than 7 next', () => {
        const card = { suit: 'hearts', value: '7', numericValue: 7 };
        gameState.discardPile = [card];
        
        gameRules.postPlayPowers(card);
        
        expect(gameState.lowerthan).toBe(true);
    });

    test('Jack takes on properties of card below it', () => {
        const six = { suit: 'hearts', value: '6', numericValue: 6 };
        const jack = { suit: 'spades', value: 'J', numericValue: 11 };
        gameState.discardPile = [six, jack];
        
        gameRules.postPlayPowers(jack);
        
        // Should have 6's power: require even card
        expect(gameState.even).toBe(true);
    });

    test('10 clears discard pile, changes direction, activates fast play', () => {
        const card = { suit: 'hearts', value: '10', numericValue: 10 };
        const otherCard = { suit: 'spades', value: '5', numericValue: 5 };
        gameState.discardPile = [otherCard, card];
        gameState.direction = 1;
        
        gameRules.postPlayPowers(card);
        
        expect(gameState.discardPile).toHaveLength(0);
        expect(gameState.graveyardPile).toHaveLength(2);
        expect(gameState.direction).toBe(-1);
        expect(gameState.fastPlayActive).toBe(true);
    });

    test('Joker sets suit requirement', () => {
        const joker = { suit: 'hearts', value: 'Joker', numericValue: 15 };
        gameState.discardPile = [joker];
        
        gameRules.postPlayPowers(joker);
        
        expect(gameState.suit).toBe('hearts');
    });

    test('four of a kind clears discard pile and activates fast play', () => {
        const card1 = { suit: 'hearts', value: '5', numericValue: 5 };
        const card2 = { suit: 'spades', value: '5', numericValue: 5 };
        const card3 = { suit: 'clubs', value: '5', numericValue: 5 };
        const card4 = { suit: 'diamonds', value: '5', numericValue: 5 };
        gameState.discardPile = [card1, card2, card3, card4];
        
        gameRules.postPlayPowers(card4);
        
        expect(gameState.discardPile).toHaveLength(0);
        expect(gameState.graveyardPile).toHaveLength(4);
        expect(gameState.fastPlayActive).toBe(true);
    });

    test('four of a kind does not trigger with different values', () => {
        const card1 = { suit: 'hearts', value: '5', numericValue: 5 };
        const card2 = { suit: 'spades', value: '6', numericValue: 6 };
        const card3 = { suit: 'clubs', value: '5', numericValue: 5 };
        const card4 = { suit: 'diamonds', value: '5', numericValue: 5 };
        gameState.discardPile = [card1, card2, card3, card4];
        
        gameRules.postPlayPowers(card4);
        
        expect(gameState.discardPile).toHaveLength(4);
        expect(gameState.graveyardPile).toHaveLength(0);
        expect(gameState.fastPlayActive).toBe(false);
    });
});

describe('complex scenarios', () => {
    test('chain plays: 10 followed by another 10', () => {
        const ten1 = { suit: 'hearts', value: '10', numericValue: 10 };
        const ten2 = { suit: 'spades', value: '10', numericValue: 10 };
        
        gameState.discardPile = [ten1];
        gameState.direction = 1;
        
        // First 10 clears pile, changes direction, activates fast play
        gameRules.postPlayPowers(ten1);
        expect(gameState.discardPile).toHaveLength(0);
        expect(gameState.direction).toBe(-1);
        expect(gameState.fastPlayActive).toBe(true);
        
        // Add second 10 to now-empty pile
        gameState.discardPile = [ten2];
        
        // Second 10 should also clear pile and change direction again
        gameRules.postPlayPowers(ten2);
        expect(gameState.discardPile).toHaveLength(0);
        expect(gameState.direction).toBe(1); // Back to original
        expect(gameState.fastPlayActive).toBe(true);
    });

    test('pickup scenario: invalid card played', () => {
        const player = new Player('test');
        const topCard = { suit: 'hearts', value: '9', numericValue: 9 };
        const invalidCard = { suit: 'spades', value: '3', numericValue: 3 };
        
        gameState.discardPile = [topCard];
        player.hand = [invalidCard];
        
        // Card should not be playable (3 < 9 with default rules)
        expect(gameRules.canPlayCard(player, invalidCard)).toBe(false);
    });

    test('rule combinations: 6 followed by 7', () => {
        const six = { suit: 'hearts', value: '6', numericValue: 6 };
        const seven = { suit: 'spades', value: '7', numericValue: 7 };
        
        // Play 6 first
        gameState.discardPile = [six];
        gameRules.postPlayPowers(six);
        expect(gameState.even).toBe(true); // Must play even
        
        // 7 is odd, but let's say it was played anyway (rule violation would be handled elsewhere)
        gameState.discardPile = [six, seven];
        gameRules.postPlayPowers(seven);
        
        // 7's power should override: must play lower than 7
        expect(gameState.even).toBe(null); // Reset
        expect(gameState.lowerthan).toBe(true);
    });
});