const gameState = require('./gameState');
const Player = require('./player');
const Deck = require('./deck');

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

            // Deal each player 3 cards face down and 3 cards face up
            gameState.players.forEach(player => {
                player.cardsFaceDown = deck.draw(3);
                player.cardsFaceUp = deck.draw(3);
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
    // Other states...
};

module.exports = stateMachine;
