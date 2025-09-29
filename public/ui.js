// Minimal UI scaffold: shows current player and player's hand, allows clicking a card to emit play
(function(){
  const socket = io();
  function $(sel){return document.querySelector(sel)}

  function renderGame(state){
    const cur = state.players[state.turnIndex];
    const status = $('#status');
    if(status) status.textContent = `Current player: ${cur?.name || '—'}`;
    const handEl = $('#hand');
    if(!handEl) return;
    handEl.innerHTML = '';
    const me = state.players.find(p=>p.isLocal) || state.players[0];
    (me?.hand || []).forEach((card, i)=>{
      const btn = document.createElement('button');
      btn.className='card';
      btn.textContent = `${card.rank}${card.suit||''}`;
      btn.onclick = ()=> socket.emit('playCard', {player: me.id, cardIndex:i});
      handEl.appendChild(btn);
    });
  }

  socket.on('connect', ()=> console.debug('ui socket connected'));
  socket.on('gameState', renderGame);

  window.smellyHeadUI = {renderGame};
})();
