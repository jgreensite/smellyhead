const gameState = {
    players: [],
    drawPile: [],
    discardPile: [],
    graveyardPile: [],
    currentState: 'waitingForPlayers',
    suit: '',
    lowerthan: 1,
    direction: 1,
    even: 0
};

module.exports = gameState;