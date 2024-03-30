window.onload = function() {
    const socket = io.connect('http://localhost:3000');

    // Register as a player
    document.getElementById('registerButton').addEventListener('click', function() {
        console.log('Clicked - Register');
        const playerName = document.getElementById('playerName').value;
        socket.emit('addPlayer', playerName);
    });

    // Start the game
    document.getElementById('startButton').addEventListener('click', function() {
        console.log('Clicked - Start');
        socket.emit('startGame');
    });

    // Update game state
    socket.on('updateUI', function(gameState) {
        drawUI(gameState.drawPile, gameState.discardPile, gameState.graveyardPile, gameState.myHand, gameState.otherPlayersCards);
    });
};

function drawUI(drawPile, discardPile, graveyardPile, otherPlayersCards, faceDownCards, handCards) {
    const drawPileCard = drawPile.length > 0 ? '[###]' : '[   ]';
    const discardPileCard = discardPile.length > 0 ? '[###]' : '[   ]';
    const graveyardPileCard = graveyardPile.length > 0 ? '[###]' : '[   ]';

    const otherPlayersCardsDisplay = otherPlayersCards.map(() => '[^^^]').join(' ');
    const faceDownCardsDisplay = faceDownCards.map(() => '[###]').join(' ');
    const handCardsDisplay = handCards.join(' ');

    const ui = `
+-------------------+     +-------------------+     +-------------------+
|     DRAW PILE     |     |    DISCARD PILE   |     |   GRAVEYARD PILE  |
|                   |     |                   |     |                   |
|       ${drawPileCard}       |     |       ${discardPileCard}       |     |       ${graveyardPileCard}       |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+

+-----------------------------------------------------------------------+
|                         OTHER PLAYERS' CARDS                          |
|  ${otherPlayersCardsDisplay} |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
|                          YOUR FACE-DOWN CARDS                         |
|  ${faceDownCardsDisplay} |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
|                             YOUR HAND CARDS                           |
|  ${handCardsDisplay} |
+-----------------------------------------------------------------------+
    `;

    document.getElementById('gameArea').textContent = ui;
}