const gameState = {
    players: [],
    drawPile: [],
    discardPile: [],
    graveyardPile: [],
    currentState: 'waitingForPlayers',
    suit:'',
    lowerthan:false,
    direction:1,
    even:false
};

module.exports = gameState;