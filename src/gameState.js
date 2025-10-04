class Game {
    constructor() {
        this.players = [];
        this.drawPile = [];
        this.discardPile = [];
        this.graveyardPile = [];
        this.currentState = 'waitingForPlayers';
        this.suit = '';
    // Rule flags default for a freshly constructed Game
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

module.exports = gameState;
module.exports.createGame = createGame;
module.exports.gameState = gameState;
