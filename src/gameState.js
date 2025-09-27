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
        if (this.players.length === 0) return null;
        return this.players[this.currentPlayerIndex];
    }

    nextPlayer() {
        if (this.players.length === 0) return;
        
        if (this.direction === 1) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } else {
            this.currentPlayerIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
        }
    }

    isPlayerTurn(socketId) {
        const currentPlayer = this.getCurrentPlayer();
        return currentPlayer && currentPlayer.socketId === socketId;
    }
}

function createGame() {
    return new Game();
}

// Create default singleton for backward compatibility
const gameState = new Game();

module.exports = { createGame, gameState };