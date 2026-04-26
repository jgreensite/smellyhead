/* global io */
let socket;
let gameState = null;
let mySocketId = null;
let selectedCards = []; // Array to support multiple card selection

// Track swapping state
let swapSelection = { handIndex: null, faceUpIndex: null };
let isSetupPhase = false;

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

    // Setup Phase Started
    socket.on('setupStarted', function(initialGameState) {
        isSetupPhase = true;
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        document.getElementById('readyButton').style.display = 'inline-block';
        document.getElementById('turnIndicator').textContent = 'Setup Phase: Swap your hand and face-up cards if you want.';
        updateGameUI(initialGameState);
    });

    // Game started - show game UI
    socket.on('gameStarted', function(initialGameState) {
        isSetupPhase = false;
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        document.getElementById('readyButton').style.display = 'none';

        // Reset selections
        selectedCards = [];
        swapSelection = { handIndex: null, faceUpIndex: null };
        document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
        document.getElementById('playSelectedButton').style.display = 'none';

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

    socket.on('playError', function(errorMsg) {
        const errEl = document.getElementById('errorMessage');
        errEl.textContent = errorMsg;
        setTimeout(() => errEl.textContent = '', 3000);
    });

    socket.on('playMessage', function(msg) {
        const errEl = document.getElementById('errorMessage');
        errEl.textContent = msg;
        errEl.style.color = 'blue';
        setTimeout(() => {
            errEl.textContent = '';
            errEl.style.color = 'red';
        }, 3000);
    });

    socket.on('gameOver', function(data) {
        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('gameOverContainer').style.display = 'block';
        document.getElementById('winnerText').textContent = `Winner: ${data.winner}`;
    });

    socket.on('resetGame', function() {
        document.getElementById('gameOverContainer').style.display = 'none';
        document.getElementById('lobby').style.display = 'block';
        document.getElementById('gameContainer').style.display = 'none';
        gameState = null;
        selectedCards = [];
        swapSelection = { handIndex: null, faceUpIndex: null };
        document.getElementById('gameArea').textContent = '';
        document.getElementById('handCards').innerHTML = '';
        document.getElementById('faceUpCards').innerHTML = '';
        document.getElementById('faceDownCards').innerHTML = '';
        document.getElementById('gameState').innerHTML = '';
    });

    socket.on('requestSuitSelection', function() {
        document.getElementById('suitSelectionOverlay').style.display = 'block';
    });

    // Suit selection buttons
    document.querySelectorAll('.suitButton').forEach(btn => {
        btn.addEventListener('click', function() {
            const chosenSuit = this.dataset.suit;
            document.getElementById('suitSelectionOverlay').style.display = 'none';
            // Play selected cards with the chosen suit
            playSelectedCards(chosenSuit);
        });
    });

    document.getElementById('cancelSuitSelection').addEventListener('click', function() {
        document.getElementById('suitSelectionOverlay').style.display = 'none';
    });

    // Draw card button
    document.getElementById('drawCardButton').addEventListener('click', function() {
        socket.emit('drawCard');
    });

    // Pick up pile button
    document.getElementById('pickUpPileButton').addEventListener('click', function() {
        socket.emit('pickUpPile');
    });

    // Ready button
    document.getElementById('readyButton').addEventListener('click', function() {
        document.getElementById('readyButton').style.display = 'none';
        socket.emit('setReady');
    });

    // Play Selected button
    document.getElementById('playSelectedButton').addEventListener('click', function() {
        playSelectedCards();
    });

    // Play Again button
    document.getElementById('playAgainButton').addEventListener('click', function() {
        socket.emit('playAgain');
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
    updateFaceDownCards();
    updateGameStateInfo();
}

function updateTurnIndicator(isMyTurn, currentPlayerName = '') {
    const indicator = document.getElementById('turnIndicator');
    const pickUpBtn = document.getElementById('pickUpPileButton');
    if (isMyTurn) {
        indicator.textContent = 'Your Turn!';
        indicator.className = 'yourTurn';
        pickUpBtn.style.display = 'inline-block';
    } else {
        indicator.textContent = currentPlayerName ? `${currentPlayerName}'s Turn` : "Waiting for turn...";
        indicator.className = 'notYourTurn';
        pickUpBtn.style.display = 'none';
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

function updateFaceDownCards() {
    const faceDownContainer = document.getElementById('faceDownCards');
    faceDownContainer.innerHTML = '<h3>Your Face-Down Cards</h3>';

    if (gameState && gameState.faceDownCards) {
        gameState.faceDownCards.forEach((card, index) => {
            // We do not know the card values for face down, just render a hidden block
            const cardElement = document.createElement('div');
            cardElement.className = 'card faceDown';
            cardElement.textContent = '🂠';
            cardElement.dataset.index = index;
            cardElement.dataset.type = 'faceDown';
            cardElement.addEventListener('click', function() {
                selectCard(this, card, index, 'faceDown');
            });
            faceDownContainer.appendChild(cardElement);
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
    if (isSetupPhase) {
        // Handle setup phase selection (swapping)
        if (type === 'hand') {
            document.querySelectorAll('#handCards .card.selected').forEach(el => el.classList.remove('selected'));
            swapSelection.handIndex = index;
            cardElement.classList.add('selected');
        } else if (type === 'faceUp') {
            document.querySelectorAll('#faceUpCards .card.selected').forEach(el => el.classList.remove('selected'));
            swapSelection.faceUpIndex = index;
            cardElement.classList.add('selected');
        }

        // If both a hand card and a faceUp card are selected, swap them
        if (swapSelection.handIndex !== null && swapSelection.faceUpIndex !== null) {
            socket.emit('swapCards', {
                handIndex: swapSelection.handIndex,
                faceUpIndex: swapSelection.faceUpIndex
            });
            // Reset local selection immediately for UX
            swapSelection = { handIndex: null, faceUpIndex: null };
            document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
        }
    } else {
        // Normal game phase selection
        if (type === 'faceDown') {
            // Face-down cards are played blind, one at a time immediately
            document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
            selectedCards = [{ card, index, type }];
            playSelectedCards();
            return;
        }

        // Toggle selection for multiple cards of the same rank from the same zone
        const isSelected = cardElement.classList.contains('selected');

        if (isSelected) {
            // Deselect
            cardElement.classList.remove('selected');
            selectedCards = selectedCards.filter(c => c.index !== index || c.type !== type);
        } else {
            // If selecting a new card, check if it matches the current selection's type and rank
            if (selectedCards.length > 0) {
                const firstSelected = selectedCards[0];
                if (type !== firstSelected.type || card.value !== firstSelected.card.value) {
                    // Mismatch in zone or rank: clear previous selection and select this one instead
                    document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
                    selectedCards = [];
                }
            }

            cardElement.classList.add('selected');
            selectedCards.push({ card, index, type });
        }

        // Update Play Selected button visibility
        const playBtn = document.getElementById('playSelectedButton');
        if (selectedCards.length > 0) {
            playBtn.style.display = 'inline-block';
        } else {
            playBtn.style.display = 'none';
        }
    }
}

function playSelectedCards(suitSelection = null) {
    if (selectedCards.length === 0) return;

    const cardIndices = selectedCards.map(c => c.index);
    const cardType = selectedCards[0].type; // All selected cards must be from the same type
    
    const payload = {
        playerId: mySocketId,
        cardIndices: cardIndices,
        cardType: cardType,
        suit: suitSelection
    };
    
    console.log('Playing cards:', payload);
    socket.emit('playCard', payload);

    // Clear selection UI immediately for responsiveness
    selectedCards = [];
    document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('playSelectedButton').style.display = 'none';
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