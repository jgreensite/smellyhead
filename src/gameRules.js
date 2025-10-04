const { gameState } = require('./gameState');

function getTopCard() {
    return gameState.discardPile[gameState.discardPile.length - 1];
}

function getSecondCard() {
    if (gameState.discardPile.length >= 2) {
        return gameState.discardPile[gameState.discardPile.length - 2];
    }
    return null;
}

function numericValueOf(card) {
    if (!card) return 0;
    if (typeof card.numericValue === 'number') return card.numericValue;
    const parsed = parseInt(card.value);
    if (!isNaN(parsed)) return parsed;
    switch (card.value) {
        case 'J': return 11;
        case 'Q': return 12;
        case 'K': return 13;
        case 'A': return 14;
        default: return 0;
    }
}

const gameRules = {
    canPlayCard(player, card) {
        const topCard = getTopCard();
        if (!topCard) return true;

        const cardValue = numericValueOf(card);
        const topValue = numericValueOf(topCard);

        if (gameState.even === true && (cardValue % 2) !== 0) return false;
        if (gameState.even === false && (cardValue % 2) === 0) return false;
        if (gameState.lowerthan === true && cardValue >= 7) return false;
        if (gameState.suit && gameState.suit !== '' && card.suit !== gameState.suit) return false;

        const noSpecial = (gameState.lowerthan === null || gameState.lowerthan === false) && (gameState.even === null) && (!gameState.suit || gameState.suit === '');
        if (noSpecial && cardValue < topValue) return false;

        // Always allow these special cards
        if (card.value === '2' || card.value === '10' || card.value === 'Joker') return true;

        return true;
    },

    postPlayPowers(playedCard) {
        const topCard = getTopCard();
        if (!topCard) return;
        const secondCard = getSecondCard();

        // Reset rule flags unless re-applied below
        gameState.even = null;
        gameState.lowerthan = null;
        gameState.suit = '';
        gameState.fastPlayActive = false;

        switch (topCard.value) {
            case '2':
                gameState.direction *= -1;
                break;
            case '4':
                gameState.direction *= -1;
                break;
            case '6':
                gameState.even = true;
                break;
            case '7':
                gameState.lowerthan = true;
                break;
            case 'J':
                if (secondCard && secondCard.value !== 'J') {
                    // Apply second card's effects
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
                        default:
                            break;
                    }
                }
                break;
            case '10':
                clearDiscardPile();
                gameState.direction *= -1;
                gameState.fastPlayActive = true;
                break;
            case 'Joker':
                gameState.suit = playedCard.suit || '';
                break;
            default:
                break;
        }

        // Four of a kind clears the discard pile
        if (gameState.discardPile.length >= 4) {
            const last = gameState.discardPile.length - 1;
            const v0 = gameState.discardPile[last].value;
            if (v0 === gameState.discardPile[last - 1].value && v0 === gameState.discardPile[last - 2].value && v0 === gameState.discardPile[last - 3].value) {
                clearDiscardPile();
                gameState.fastPlayActive = true;
            }
        }
    },

    clearDiscardPile() {
        if (gameState.discardPile.length === 0) return;
        gameState.graveyardPile.push(...gameState.discardPile);
        gameState.discardPile = [];
    }
};

function clearDiscardPile() {
    if (gameState.discardPile.length === 0) return;
    gameState.graveyardPile.push(...gameState.discardPile);
    gameState.discardPile = [];
}

module.exports = gameRules;