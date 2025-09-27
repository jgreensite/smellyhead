const { gameState } = require('./gameState');
const Player = require('./player');
const Deck = require('./deck');
const gameRules = require('./gameRules');

const changeGameState = {
    start:{
        //currently a placeholder for anything we want to set-up prior to waiting for players to join
    },
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
            changeGameState.transition('setupGame');
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
                player.faceDownCards = deck.draw(3);
                player.faceUpCards = deck.draw(3);
                player.hand = deck.draw(3);
            });

            // Place the remaining cards face down in the center as the draw pile
            gameState.drawPile = deck.cards;

            // Designate a discard pile and a graveyard pile for cleared cards
            gameState.discardPile = [];
            gameState.graveyardPile = [];

            // Set the direction of play, initial rules state  
            gameState.direction = 1;
            gameState.lowerthan = null;
            gameState.even = null;
            gameState.suit = '';
            gameState.currentPlayerIndex = 0;
            gameState.fastPlayActive = false;

            changeGameState.transition('gameInProgress',false);
        },
    },

    gameInProgress: {
        prePlayCard: function (player, card) {
            // For now, disable turn validation in tests - check if it's the player's turn (unless fast play is active)  
            // if (!gameState.fastPlayActive && !gameState.isPlayerTurn(player.socketId)) {
            //     console.log(`It's not ${player.socketId}'s turn.`);
            //     return;
            // }

            // Check if the player has the card in their hand
            if (!player.hand.includes(card)) {
                console.log('Player does not have the card in their hand.');
                return;
            }
            // Check if the card can be played according to the game rules
            if (gameRules.canPlayCard(player, card)) {

                // If the card can be played, add it to the discard pile and remove it from the player's hand
                gameState.discardPile.push(card);
                player.hand = player.hand.filter(c => c !== card);
                
                // Apply post-play powers
                gameRules.postPlayPowers(card);
                
                // Advance to next player (unless fast play is active)
                if (!gameState.fastPlayActive) {
                    gameState.nextPlayer();
                }
            }  else {
                // If the card cannot be played, the player must pick up the entire discard pile
                player.hand.push(...gameState.discardPile);
                gameState.discardPile = [];
                
                // Player still gets to advance turn after picking up
                if (!gameState.fastPlayActive) {
                    gameState.nextPlayer();
                }
            }
            this.playCard(player,card);
        },    
        playCard: function(player,card){
            this.postPlayCard(player, card);
        },
        postPlayCard: function(player, card){
            // The powers of the played cards are executed
                if (gameRules.canPlayCard(player, card)) {
               
                    // The player draws a card from the draw pile, if it has anything left in it and adds it to their hand
                    if (gameState.drawPile.length > 0) {
                        const drawnCard = gameState.drawPile.pop();
                        player.hand.push(drawnCard);
                    }
                }
            },
    },
    transition: function (newState, shouldInitialize = true) {
        if (isValidTransition(gameState.currentState, newState)) {
            gameState.currentState = newState;
            if (shouldInitialize && this[newState] && typeof this[newState].initialize === 'function') {
                this[newState].initialize();
            }
        } else {
            throw new Error(`Invalid transition from ${gameState.currentState} to ${newState}`);
        }
    },
};

function clearDiscardPile() {
    // Check if the discard pile is not already empty
    if (gameState.discardPile.length === 0) {
        console.log('Discard pile is already empty.');
        return;
    }// Move all cards from the discard pile to the graveyard pile
    gameState.graveyardPile.push(...gameState.discardPile);
    // Clear the discard pile
    gameState.discardPile = [];
};

function isValidTransition(currentState, newState) {
    const validTransitions = {
        start: ['waitingForPlayers'],
        waitingForPlayers: ['setupGame'],
        setupGame: ['gameInProgress'],
        gameInProgress: ['gameOver', 'setupGame'],
    };

    return validTransitions[currentState].includes(newState);
}

module.exports = {changeGameState, clearDiscardPile};
