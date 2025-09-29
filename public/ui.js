// Minimal UI scaffold: shows current player and player's hand, allows clicking a card to emit play
/* global io */
(function(){
  const socket = io();
  function $(sel){return document.querySelector(sel);}

  function renderGame(state){
    const status = $('#status');
    if(status) status.textContent = `Players: ${state.players.length} | Current: ${state.currentPlayerIndex ?? state.turnIndex ?? 0}`;

    const discardCountEl = $('#discardCount');
    const drawCountEl = $('#drawCount');
    if(discardCountEl) discardCountEl.textContent = String((state.discardPile && state.discardPile.length) || 0);
    if(drawCountEl) drawCountEl.textContent = String((state.drawPile && state.drawPile.length) || 0);

    const faceUpEl = $('#faceUp');
    const faceDownEl = $('#faceDown');
    if(faceUpEl) faceUpEl.innerHTML = '';
    if(faceDownEl) faceDownEl.innerHTML = '';
    if(state.discardPile && state.discardPile.length > 0 && faceUpEl){
      const top = state.discardPile[state.discardPile.length - 1];
      const d = document.createElement('div');
      d.className = 'card';
      d.textContent = `${top.rank}${top.suit || ''}`;
      faceUpEl.appendChild(d);
    }
    if(state.drawPile && state.drawPile.length > 0 && faceDownEl){
      const dd = document.createElement('div');
      dd.className = 'card facedown';
      dd.textContent = '🂠';
      faceDownEl.appendChild(dd);
    }

    const handEl = $('#hand');
    if(!handEl) return;
    handEl.innerHTML = '';
    const me = state.players.find(p=>p.isLocal) || state.players[0];
    (me?.hand || []).forEach((card, i)=>{
      const btn = document.createElement('button');
      btn.className='card';
      btn.textContent = `${card.rank}${card.suit||''}`;
      btn.onclick = ()=> socket.emit('playCard', { player: me.id, cardIndex:i });
      handEl.appendChild(btn);
    });
  }

  // wire join button
  const joinButton = document.getElementById('joinButton');
  if(joinButton){
    joinButton.addEventListener('click', ()=>{
      const nameInput = document.getElementById('playerName');
      const name = (nameInput && nameInput.value) || `Local${Math.floor(Math.random()*1000)}`;
      socket.emit('addPlayer', { name }, (player) => {
        if(player && player.id){
          // mark player as local and request current state
          player.isLocal = true;
          // some servers callback with player and others may not; always ask for state
          socket.emit('getGameState');
        }
      });
    });
  }

  socket.on('connect', ()=> console.debug('ui socket connected'));
  socket.on('gameState', renderGame);

  // expose for tests
  window.smellyHeadUI = { renderGame };
})();
