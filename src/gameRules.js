const gameState = require('./gameState');

function getTopCard() {
    return gameState.discardPile[gameState.discardPile.length - 1];
}

function getSecondCard() {
    if(gameState.discardPile.length > 2){
        return gameState.discardPile[gameState.discardPile.length - 2];
    } else {
        return null;
    }
}

const gameRules = {

    canPlayCard: function (player, card) {
        let topCard = getTopCard();
        // If the discard pile is empty, any card can be played
        if (!topCard) {
            return true;
        }

        // Get numeric values for comparison (handle both test cards and real cards)
        const cardValue = card.numericValue || parseInt(card.value) || (card.value === 'J' ? 11 : card.value === 'Q' ? 12 : card.value === 'K' ? 13 : card.value === 'A' ? 14 : 0);
        const topCardValue = topCard.numericValue || parseInt(topCard.value) || (topCard.value === 'J' ? 11 : topCard.value === 'Q' ? 12 : topCard.value === 'K' ? 13 : topCard.value === 'A' ? 14 : 0);

        // Check the card can be played based on the status of the gameState.even and gameState.lowerthan
        const conditions = [
            !(gameState.even === 1 && cardValue % 2 !== 0), // Must play an even
            !(gameState.even === -1 && cardValue % 2 === 0), // Must play an odd
            !(gameState.lowerthan === 1 && cardValue <= topCardValue), // Must play higher than top card
            !(gameState.lowerthan === -1 && cardValue >= 7), // Must play lower than 7
        ];
        if (!conditions.every(condition => condition)) {
            return false;
        }

        // Check the special powers of the card the player is trying to play
        switch (card.value) {
            case '2':
                // 2s can be played on anything and reset the pile
                return true;
            case '10':
                // 10s can be played on anything
                return true;
            case 'Joker':
                // Jokers can be played on anything
                return true;
            default:
                // If the card has no special power, check if it follows normal rules
                if (gameState.suit && gameState.suit !== '' && card.suit !== gameState.suit) {
                    return false;
                }
                return cardValue >= topCardValue;
        }
    },
    postPlayPowers: function(){
        let topCard = getTopCard();
        
        // If there's no top card, no powers to apply
        if (!topCard) {
            return;
        }
        
        let secondCard = getSecondCard();
        //first reset all the rules
        gameState.even = 0; // don't have to play an even
        gameState.lowerthan = 1; // must play a card higher than the top card
        gameState.suit = ''; // clear any suit requirement
        
        // Check the special powers of the top card
        switch (topCard.value) {
            case '2':
                // 2s reset the pile and change direction
                gameState.direction *= -1;
                break;
            case '4':
                // Changes direction of play
                gameState.direction *= -1;
                break;
            case '6':
                // The next player must play an even card
                gameState.even = 1;
                break;
            case '7':
                // The next player must play a card lower than 7
                gameState.lowerthan = -1;
                break;
            case 'J':
                // The Jack takes on the power of the card below it
                if (secondCard) {
                    // Recursively apply the second card's powers
                    gameState.discardPile.pop(); // temporarily remove jack
                    this.postPlayPowers();
                    gameState.discardPile.push(topCard); // put jack back
                }
                break;
            case '10':
                // Clears out the discard pile into the graveyard
                this.clearDiscardPile();
                // Changes game direction
                gameState.direction *= -1;
                break;
            case 'Joker':
                // Can be played on anything, changes the suit that must be played ontop of it
                // Note: suit should be set when the joker is played, not here
                break;
            default:
                // If the top card has no special power, then the game rules are not affected
                break;
        }
        //if 4 of the same type of card are at the top of the discard pile then the discard pile is cleared out
        if(gameState.discardPile.length >= 4){
            if(gameState.discardPile[gameState.discardPile.length-1].value === 
                gameState.discardPile[gameState.discardPile.length-2].value &&
                gameState.discardPile[gameState.discardPile.length-2].value ===
                gameState.discardPile[gameState.discardPile.length-3].value &&
                gameState.discardPile[gameState.discardPile.length-3].value ===
                gameState.discardPile[gameState.discardPile.length-4].value){
                this.clearDiscardPile();
            }
        }
    },
    
    clearDiscardPile: function() {
        // Move all cards from the discard pile to the graveyard pile
        gameState.graveyardPile.push(...gameState.discardPile);
        // Clear the discard pile
        gameState.discardPile = [];
    }
};

module.exports = gameRules