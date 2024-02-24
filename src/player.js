class Player {
    constructor(socketId) {
        this.socketId = socketId;
        this.hand = [];
        this.faceUpCards = [];
        this.faceDownCards = [];
    }
}

module.exports = Player;