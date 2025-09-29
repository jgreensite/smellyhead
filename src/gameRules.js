const { gameState } = require('./gameState');

function getTopCard() {
    return gameState.discardPile[gameState.discardPile.length - 1];
}

function getSecondCard() {
<<<<<<< HEAD
    if (gameState.discardPile.length >= 2) {
=======
    if(gameState.discardPile.length >= 2){
>>>>>>> 74b7e28 (feat(ui): wire Join button, show draw/discard counts and face-up/down; add ui integration test)
        return gameState.discardPile[gameState.discardPile.length - 2];
    }
    return null;
}

const gameRules = {
    canPlayCard: function (player, card) {
        const topCard = getTopCard();
        if (!topCard) return true;

<<<<<<< HEAD
        const cardValue = card.numericValue || (parseInt(card.value) || (card.value === 'J' ? 11 : card.value === 'Q' ? 12 : card.value === 'K' ? 13 : card.value === 'A' ? 14 : 0));
        const topValue = topCard.numericValue || (parseInt(topCard.value) || (topCard.value === 'J' ? 11 : topCard.value === 'Q' ? 12 : topCard.value === 'K' ? 13 : topCard.value === 'A' ? 14 : 0));
=======
        // Get numeric values for comparison (handle both test cards and real cards)
    const cardValue = card.numericValue || parseInt(card.value) || (card.value === 'J' ? 11 : card.value === 'Q' ? 12 : card.value === 'K' ? 13 : card.value === 'A' ? 14 : 0);
    const topCardValue = topCard.numericValue || parseInt(topCard.value) || (topCard.value === 'J' ? 11 : topCard.value === 'Q' ? 12 : topCard.value === 'K' ? 13 : topCard.value === 'A' ? 14 : 0);
>>>>>>> 74b7e28 (feat(ui): wire Join button, show draw/discard counts and face-up/down; add ui integration test)

        if (gameState.even === true && (cardValue % 2) !== 0) return false;
        if (gameState.even === false && (cardValue % 2) === 0) return false;
        if (gameState.lowerthan === true && cardValue >= 7) return false;
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

        const gameRules = {
            canPlayCard(player, card) {
                const topCard = getTopCard();
                if (!topCard) return true;

                const cardValue = card.numericValue || parseInt(card.value) || (card.value === 'J' ? 11 : card.value === 'Q' ? 12 : card.value === 'K' ? 13 : card.value === 'A' ? 14 : 0);
                const topValue = topCard.numericValue || parseInt(topCard.value) || (topCard.value === 'J' ? 11 : topCard.value === 'Q' ? 12 : topCard.value === 'K' ? 13 : topCard.value === 'A' ? 14 : 0);

                if (gameState.even === true && (cardValue % 2) !== 0) return false;
                if (gameState.even === false && (cardValue % 2) === 0) return false;
                if (gameState.lowerthan === true && cardValue >= 7) return false;
                if (gameState.suit && gameState.suit !== '' && card.suit !== gameState.suit) return false;

                const noSpecial = (gameState.lowerthan === null || gameState.lowerthan === false) && (gameState.even === null) && (!gameState.suit || gameState.suit === '');
                if (noSpecial && cardValue < topValue) return false;

                if (card.value === '2' || card.value === '10' || card.value === 'Joker') return true;

                return true;
            },

            postPlayPowers(playedCard) {
                const topCard = getTopCard();
                if (!topCard) return;
                const secondCard = getSecondCard();

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