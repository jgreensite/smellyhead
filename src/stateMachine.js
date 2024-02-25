const gameState = require('./gameState');
const Player = require('./player');
const Deck = require('./deck');
const gameRules = require('./gameRules');

const stateMachine = {
    waitingForPlayers: {
        addPlayer: function (socketId) {
            const playerExists = gameState.players.some(player => player.socketId === socketId);
            if (!playerExists) {
                const newPlayer = new Player(socketId);
                gameState.players.push(newPlayer);
                console.log(`Player ${socketId} added. Total players: ${gameState.players.length}`);
            }
        },
        startGame: function (socketId) {
            const playerExists = gameState.players.some(player => player.socketId === socketId);
            if (!playerExists) {
                console.log(`Player ${socketId} does not exist.`);
                return;
            }

            const minPlayersToStart = 2;
            if (gameState.players.length < minPlayersToStart) {
                console.log(`Need at least ${minPlayersToStart} players to start the game.`);
                return;
            }

            stateMachine.transition('setupGame');
        },
        removePlayer: function (socketId) {
            const playerIndex = gameState.players.findIndex(player => player.socketId === socketId);
            if (playerIndex !== -1) {
                gameState.players.splice(playerIndex, 1);
                console.log(`Player ${socketId} removed. Total players: ${gameState.players.length}`);
            } else {
                console.log(`Player ${socketId} does not exist.`);
            }
        },
        listPlayers: function () {
            return gameState.players;
        },
        getPlayer: function (socketId) {
            return gameState.players.find(player => player.socketId === socketId);
        },
        clearPlayers: function () {
            gameState.players = [];
        },
    },
    setupGame: {
        initialize: function () {
            const numPlayers = gameState.players.length;
            const numDecks = Math.ceil(numPlayers / 2);  // Determine the number of decks needed
            const deck = new Deck(numDecks);

            deck.shuffle();  // Shuffle all decks together

            // Deal each player 3 cards face down, 3 cards face up and 3 cards in their hand
            gameState.players.forEach(player => {
                player.cardsFaceDown = deck.draw(3);
                player.cardsFaceUp = deck.draw(3);
                player.hand = deck.draw(3);
            });

            // Place the remaining cards face down in the center as the draw pile
            gameState.drawPile = deck.cards;

            // Designate a discard pile and a graveyard pile for cleared cards
            gameState.discardPile = [];
            gameState.graveyardPile = [];

            stateMachine.transition('gameInProgress');
        },
    },

    gameInProgress: {
        playCard: function (player, card) {
            // Check if the card can be played according to the game rules
            if (gameRules.canPlayCard(player, card)) {

                //TODO - Remove this it is not needed
                // Check to ensure card is not undefined
                if (!card) {
                    throw new Error('Card is undefined');
                }

                // Check if the card has a special power and execute it
                if (gameRules.specialCardPowers[card.value]) {
                    gameRules.specialCardPowers[card.value](player);
                }

                // If the card can be played, add it to the discard pile and remove it from the player's hand
                gameState.discardPile.push(card);
                player.hand = player.hand.filter(c => c !== card);
                
                // After playing a card, the player draws a card from the draw pile
                if (gameState.drawPile.length > 0) {
                    const drawnCard = gameState.drawPile.pop();
                    player.hand.push(drawnCard);
                } else if (player.faceUpCards.length > 0) {
                    // If the draw pile is empty, the player must play from their face-up cards
                    // The player can choose which face-up card to play in their next turn
                } else if (player.faceDownCards.length > 0) {
                    // After using all face-up cards, the player can then use one of their face-down cards
                    // The player can choose which face-down card to play
                }
            } else {
                // If the card cannot be played, the player must pick up the entire discard pile
                player.hand.push(...gameState.discardPile);
                gameState.discardPile = [];
            }
        },
        clearDiscardPile: function () {
            // Move all cards from the discard pile to the graveyard pile
            gameState.graveyardPile.push(...gameState.discardPile);
            // Clear the discard pile
            gameState.discardPile = [];
        },
    },
    transition: function (newState) {
        gameState.currentState = newState;
    },
};
module.exports = stateMachine;
