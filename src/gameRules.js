const gameState = require('./gameState');

const gameRules = {
    specialCardPowers: {
        // Define your special card powers here
        // For example:
        // 'Ace': function(player) { /* special power for Ace */ },
        // 'King': function(player) { /* special power for King */ },
        // etc.
    },
    
    canPlayCard: function (player, card) {
        // Get the top card of the discard pile
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];

        // If the discard pile is empty, any card can be played
        if (!topCard) {
            return true;
        }

        // Check the special powers of the card the player is trying to play
        switch (card.value, card.suit) {
            case '2':
            case 'Joker':
                // Can be played on anything, changes the suit that must be played ontop of it to the value specified in card.suit
                gameState.suit = card.suit
                return true;
            default:
                // If the card has no special power, it must be the same or higher than the top card
                if (card.value < topCard.value) {
                    return false;
                }
        }

        // Check the special powers of the top card
        switch (topCard.value) {
            case '7':
                // The next player must play a card lower than 7
                return card.value < 7;
            case '6':
                // The next player must play an even card
                return card.value % 2 === 0;
            case 'Joker':
                return card.suit = gameState.suit;
            default:
                // If the top card has no special power, the player can play a card of the same or greater
                return card.value === topCard.value
        }
    },
};

module.exports = gameRules