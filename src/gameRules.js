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

        // Check the card can be played based on the status of the gameState.even and gameState.lowerthan
        const conditions = [
            !(gameState.even == 2 && card.value % 2 == 0), // Must play an even
            !(!gameState.even == 1 && card.value % 2 != 0), // Must play an odd
            !(gameState.lowerthan == 1 && card.value < 7), // Must play lower than a 7
            !(!gameState.lowerthan == -1 && card.value >7), // Must play higher than a 7
        ];
        if (!conditions.every(condition => condition)) {
            return false;
        }

        // Check the special powers of the card the player is trying to play
        switch (card.value) {
            case '2':

            default:
                // If the card has no special power, the player can play a card based on the current game rules
        }
    },
    postPlayPowers: function(){
        let topCard = getTopCard();
        let secondCard = getSecondCard();
        //first reset all the rules
        gameState.even = 0; // don't have to play an even
        gameState.lowerthan = 1; // must play a card higher than the top card
        
        // Check the special powers of the top card
        switch (topCard.value) {
            case '4':
                // Changes direction of play
                gameState.direction *= -1;
            case '6':
                // The next player must play an even card
                gameState.even = 1;
            case '7':
                // The next player must play a card lower than 7
                gameState.lowerthan = -1;
            case 'J':
                // The Jack is the same as the card below it
                topCard = secondCard;
            case '10':
                // Clears out the discard pile into the graveyard
                clearDiscardPile();
                // Changes game direction
                gameState.direction *= -1;
            case 'Joker':
                // Can be played on anything, changes the suit that must be played ontop of it to the value specified in card.suit
                gameState.suit = card.suit
            default:
                // If the top card has no special power, then the game rules are not affected
        }
        //if 4 of the same type of card are at the top of the discard pile then the discard pile is cleared out
        if(gameState.discardPile.length > 4){
            if(gameState.discardPile[gameState.discardPile.length-1].value === 
                gameState.discardPile[gameState.discardPile.length-2].value &&
                gameState.discardPile[gameState.discardPile.length-2].value ===
                gameState.discardPile[gameState.discardPile.length-3].value &&
                gameState.discardPile[gameState.discardPile.length-3].value ===
                gameState.discardPile[gameState.discardPile.length-4].value){
                clearDiscardPile();
            }
        }
    }
};

module.exports = gameRules