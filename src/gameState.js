class Game {
    constructor() {
        this.players = [];
        this.drawPile = [];
        this.discardPile = [];
        this.graveyardPile = [];
        this.currentState = 'waitingForPlayers';
        this.suit = '';
        this.lowerthan = false;
        this.direction = 1;
        this.even = false;
        this.currentPlayerIndex = 0;
        this.fastPlayActive = false;
    }

    getCurrentPlayer() {
        if (!this.players || this.players.length === 0) return null;
        return this.players[this.currentPlayerIndex % this.players.length];
    }

    nextPlayer() {
        if (!this.players || this.players.length === 0) return;
        this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;
    }

    isPlayerTurn(socketId) {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return false;
        return currentPlayer.socketId === socketId;
    }
}

function createGame() {
    return new Game();
}

// Create and export a singleton for backwards compatibility and tests
const gameState = createGame();
// Default rule flags should be neutral (null) for shared singleton
gameState.lowerthan = null;
gameState.even = null;

module.exports = gameState;
module.exports.createGame = createGame;
module.exports.gameState = gameState;
class Game {
    constructor() {
        this.players = [];
        this.drawPile = [];
        this.discardPile = [];
        this.graveyardPile = [];
        this.currentState = 'waitingForPlayers';
        this.suit = '';
    this.lowerthan = false;
    this.direction = 1;
    this.even = false;
    this.currentPlayerIndex = 0;
    this.fastPlayActive = false;
    }

    getCurrentPlayer() {
        if (!this.players || this.players.length === 0) return null;
        return this.players[this.currentPlayerIndex % this.players.length];
    }

    nextPlayer() {
        if (!this.players || this.players.length === 0) return;
        this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;
    }

    isPlayerTurn(socketId) {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return false;
        return currentPlayer.socketId === socketId;
=======
        this.lowerthan = 1;
        this.direction = 1;
        this.even = 0;
        this.currentPlayerIndex = 0;
    }

    getCurrentPlayer() {
        if (!this.players || this.players.length === 0) return null;
        return this.players[this.currentPlayerIndex % this.players.length];
    }

    nextPlayer() {
        if (!this.players || this.players.length === 0) return;
        this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;
    }

    isPlayerTurn(socketId) {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return false;
        return currentPlayer.socketId === socketId;
    }
}

function createGame() {
    return new Game();
}

// Create default singleton for backward compatibility
const gameState = createGame();
// The shared singleton used by tests and server should default rule flags to null
gameState.lowerthan = null;
gameState.even = null;

// Default export is the singleton, but also expose createGame and gameState for both import styles
module.exports = gameState;
module.exports.createGame = createGame;
module.exports.gameState = gameState;
const gameState = createGame();

module.exports = gameState;
module.exports.createGame = createGame;
module.exports.gameState = gameState;
>>>>>>> 74b7e28 (feat(ui): wire Join button, show draw/discard counts and face-up/down; add ui integration test)
