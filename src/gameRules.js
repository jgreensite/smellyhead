const { gameState } = require('./gameState');

function getTopCard() {
    return gameState.discardPile[gameState.discardPile.length - 1];
}

function getSecondCard() {
    if(gameState.discardPile.length >= 2){
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

        // Check the card can be played based on the status of the gameState rule flags
        // Must play even card
        if (gameState.even === true && card.numericValue % 2 !== 0) {
            return false;
        }
        // Must play odd card  
        if (gameState.even === false && card.numericValue % 2 === 0) {
            return false;
        }
        // Must play lower than 7
        if (gameState.lowerthan === true && card.numericValue >= 7) {
            return false;
        }
        
        // Check if specific suit is required
        if (gameState.suit && gameState.suit !== '' && card.suit !== gameState.suit) {
            return false;
        }

        // Default rule: card must be higher than or equal to top card
        // Only apply this when no other special rules are active
        if (gameState.lowerthan === null && gameState.even === null && 
            (!gameState.suit || gameState.suit === '') &&
            card.numericValue < topCard.numericValue) {
            return false;
        }

        return true;
    },
    
    postPlayPowers: function(playedCard){
        let topCard = getTopCard();
        let secondCard = getSecondCard();
        
        // Reset rule flags to defaults
        gameState.even = null; // no parity requirement
        gameState.lowerthan = null; // must play higher than or equal to top card
        gameState.suit = ''; // no suit requirement
        gameState.fastPlayActive = false; // reset fast play
        
        // Check the special powers of the top card (the card just played)
        switch (topCard.value) {
            case '4':
                // Changes direction of play
                gameState.direction *= -1;
                break;
            case '6':
                // The next player must play an even card
                gameState.even = true;
                break;
            case '7':
                // The next player must play a card lower than 7
                gameState.lowerthan = true;
                break;
            case 'J':
                // The Jack is the same as the card below it
                if (secondCard) {
                    // Apply second card's effects instead of Jack's
                    switch (secondCard.value) {
                        case '4':
                            gameState.direction *= -1;
                            break;
                        case '6':
                            gameState.even = true;
                            break;
                        case '7':
                            gameState.lowerthan = true;
                            break;
                        case '10':
                            clearDiscardPile();
                            gameState.direction *= -1;
                            gameState.fastPlayActive = true;
                            break;
                        case 'Joker':
                            gameState.suit = secondCard.suit || '';
                            break;
                        // No recursion for other Jacks
                    }
                }
                break;
            case '10':
                // Clears out the discard pile into the graveyard and changes direction
                clearDiscardPile();
                gameState.direction *= -1;
                // Activate fast play mode for chain clearing
                gameState.fastPlayActive = true;
                break;
            case 'Joker':
                // Can be played on anything, changes the suit requirement
                gameState.suit = playedCard.suit || '';
                break;
            default:
                // If the top card has no special power, then the game rules are not affected
                break;
        }
        
        // Check for four-of-a-kind at top of discard pile
        if(gameState.discardPile.length >= 4){
            if(gameState.discardPile[gameState.discardPile.length-1].value === 
                gameState.discardPile[gameState.discardPile.length-2].value &&
                gameState.discardPile[gameState.discardPile.length-2].value ===
                gameState.discardPile[gameState.discardPile.length-3].value &&
                gameState.discardPile[gameState.discardPile.length-3].value ===
                gameState.discardPile[gameState.discardPile.length-4].value){
                clearDiscardPile();
                // Activate fast play for chain reactions
                gameState.fastPlayActive = true;
            }
        }
    }
};

function clearDiscardPile() {
    // Check if the discard pile is not already empty
    if (gameState.discardPile.length === 0) {
        console.log('Discard pile is already empty.');
        return;
    }
    // Move all cards from the discard pile to the graveyard pile
    gameState.graveyardPile.push(...gameState.discardPile);
    // Clear the discard pile
    gameState.discardPile = [];
}

module.exports = gameRules;