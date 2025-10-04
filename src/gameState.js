/**
 * Game represents the shared state for a Smellyhead game session.
 * It can be instantiated with `createGame()` or a singleton `gameState` is provided
 * for backward compatibility.
 */
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

    /**
     * Return the current player object or null if no players exist.
     * @returns {Object|null}
     */
    getCurrentPlayer() {
        if (this.players.length === 0) return null;
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Advance currentPlayerIndex according to direction.
     */
    nextPlayer() {
        if (this.players.length === 0) return;
        
        if (this.direction === 1) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } else {
            this.currentPlayerIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
        }
    }

    /**
     * Return true if the provided socketId matches the current player's turn.
     * @param {string} socketId
     * @returns {boolean}
     */
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
const gameState = new Game();

module.exports = { createGame, gameState };