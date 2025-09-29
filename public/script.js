let socket;
let gameState = null;
let mySocketId = null;
let selectedCard = null;

window.onload = function() {
    socket = io.connect('http://localhost:3000');

    // Store our socket ID
    socket.on('connect', function() {
        mySocketId = socket.id;
    });

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

    // Game started - show game UI
    socket.on('gameStarted', function(initialGameState) {
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        updateGameUI(initialGameState);
    });

    // Update game state
    socket.on('updateUI', function(newGameState) {
        updateGameUI(newGameState);
    });

    // Handle turn notifications
    socket.on('yourTurn', function() {
        updateTurnIndicator(true);
    });

    socket.on('notYourTurn', function(currentPlayerName) {
        updateTurnIndicator(false, currentPlayerName);
    });

    // Draw card button
    document.getElementById('drawCardButton').addEventListener('click', function() {
        socket.emit('drawCard');
    });
};

function updateGameUI(newGameState) {
    gameState = newGameState;
    
    // Update ASCII game area
    drawUI(gameState.drawPile, gameState.discardPile, gameState.graveyardPile, 
           gameState.otherPlayersCards, gameState.faceDownCards, gameState.handCards);
    
    // Update interactive card displays
    updateHandCards();
    updateFaceUpCards();
    updateGameStateInfo();
}

function updateTurnIndicator(isMyTurn, currentPlayerName = '') {
    const indicator = document.getElementById('turnIndicator');
    if (isMyTurn) {
        indicator.textContent = 'Your Turn!';
        indicator.className = 'yourTurn';
    } else {
        indicator.textContent = currentPlayerName ? `${currentPlayerName}'s Turn` : "Waiting for turn...";
        indicator.className = 'notYourTurn';
    }
}

function updateHandCards() {
    const handContainer = document.getElementById('handCards');
    handContainer.innerHTML = '<h3>Your Hand</h3>';
    
    if (gameState && gameState.myHand) {
        gameState.myHand.forEach((card, index) => {
            const cardElement = createCardElement(card, index, 'hand');
            handContainer.appendChild(cardElement);
        });
    }
}

function updateFaceUpCards() {
    const faceUpContainer = document.getElementById('faceUpCards');
    faceUpContainer.innerHTML = '<h3>Your Face-Up Cards</h3>';
    
    if (gameState && gameState.faceUpCards) {
        gameState.faceUpCards.forEach((card, index) => {
            const cardElement = createCardElement(card, index, 'faceUp');
            faceUpContainer.appendChild(cardElement);
        });
    }
}

function createCardElement(card, index, type) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.textContent = `${card.value}${card.suit ? card.suit.charAt(0).toUpperCase() : ''}`;
    cardElement.dataset.index = index;
    cardElement.dataset.type = type;
    
    // Add click handler for playable cards
    cardElement.addEventListener('click', function() {
        selectCard(this, card, index, type);
    });
    
    return cardElement;
}

function selectCard(cardElement, card, index, type) {
    // Remove previous selection
    document.querySelectorAll('.card.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select this card
    cardElement.classList.add('selected');
    selectedCard = { card, index, type };
    
    // Try to play the card
    playSelectedCard();
}

function playSelectedCard() {
    if (!selectedCard) return;
    
    console.log('Playing card:', selectedCard);
    socket.emit('playCard', {
        playerId: mySocketId,
        cardIndex: selectedCard.index,
        cardType: selectedCard.type,
        card: selectedCard.card
    });
    
    // Clear selection
    selectedCard = null;
    document.querySelectorAll('.card.selected').forEach(el => {
        el.classList.remove('selected');
    });
}

function updateGameStateInfo() {
    const stateContainer = document.getElementById('gameState');
    if (!gameState) return;
    
    let stateInfo = `
        <strong>Game State:</strong><br>
        Players: ${gameState.playerCount || 0}<br>
        Draw Pile: ${gameState.drawPile ? gameState.drawPile.length : 0} cards<br>
        Discard Pile: ${gameState.discardPile ? gameState.discardPile.length : 0} cards<br>
    `;
    
    // Show current rules in effect
    if (gameState.currentRules) {
        stateInfo += '<strong>Current Rules:</strong><br>';
        if (gameState.currentRules.even === true) {
            stateInfo += '<span class="rule-indicator">Must play EVEN card</span>';
        } else if (gameState.currentRules.even === false) {
            stateInfo += '<span class="rule-indicator">Must play ODD card</span>';
        }
        
        if (gameState.currentRules.lowerthan === true) {
            stateInfo += '<span class="rule-indicator">Must play card LOWER than 7</span>';
        }
        
        if (gameState.currentRules.suit && gameState.currentRules.suit !== '') {
            stateInfo += `<span class="rule-indicator">Must play ${gameState.currentRules.suit.toUpperCase()}</span>`;
        }
        
        if (gameState.currentRules.fastPlayActive) {
            stateInfo += '<span class="rule-indicator">FAST PLAY ACTIVE</span>';
        }
    }
    
    stateContainer.innerHTML = stateInfo;
}

// Keep the original ASCII UI function for now
function drawUI(drawPile, discardPile, graveyardPile, otherPlayersCards, faceDownCards, handCards) {
    const drawPileCard = drawPile && drawPile.length > 0 ? '[###]' : '[   ]';
    const discardPileCard = discardPile && discardPile.length > 0 ? '[###]' : '[   ]';
    const graveyardPileCard = graveyardPile && graveyardPile.length > 0 ? '[###]' : '[   ]';

    const otherPlayersCardsDisplay = otherPlayersCards ? otherPlayersCards.map(() => '[^^^]').join(' ') : '';
    const faceDownCardsDisplay = faceDownCards ? faceDownCards.map(() => '[###]').join(' ') : '';
    const handCardsDisplay = handCards ? handCards.map(card => `[${card.value}${card.suit ? card.suit.charAt(0) : ''}]`).join(' ') : '';

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