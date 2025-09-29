/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('UI integration (mock socket)', () => {
  let originalIo;

  beforeEach(() => {
    // prepare DOM: load index.html minimal parts
    document.body.innerHTML = `
      <div id="status"></div>
      <input id="playerName" />
      <button id="joinButton">Join as Local Player</button>
      <div id="discardCount"></div>
      <div id="drawCount"></div>
      <div id="faceUp"></div>
      <div id="faceDown"></div>
      <div id="hand"></div>
    `;

    // mock io() global for ui.js to use
    originalIo = global.io;
    const listeners = {};
    const socket = {
      on: (evt, cb) => { listeners[evt] = cb; },
      emit: jest.fn((evt, data, cb) => {
        // simulate server addPlayer callback
        if(evt === 'addPlayer'){
          const player = { id: 'p1', name: data.name };
          if(typeof cb === 'function') cb(player);
        }
      }),
    };
    global.io = () => socket;

    // load the ui.js file into the jsdom environment
    const uiCode = fs.readFileSync(path.join(__dirname, '..', 'public', 'ui.js'), 'utf8');
    // evaluate in the global context
    eval(uiCode);

    // expose helpers
    global.__mockSocket = { socket: global.io(), listeners };
  });

  afterEach(() => {
    global.io = originalIo;
    delete global.__mockSocket;
  });

  test('clicking join emits addPlayer and updates UI on gameState', () => {
    const joinBtn = document.getElementById('joinButton');
    expect(joinBtn).toBeTruthy();
    // simulate click
    joinBtn.click();

    // ensure we emitted addPlayer
    const socket = global.io();
    expect(socket.emit).toHaveBeenCalled();

    // simulate server sending gameState
    const state = {
      players: [{ id: 'p1', name: 'Local', isLocal: true, hand: [{rank: 'A', suit: '♠'}] }],
      discardPile: [{ rank: '5', suit: '♥' }],
      drawPile: [1,2,3],
      currentPlayerIndex: 0,
    };

    const listeners = global.__mockSocket.listeners;
    expect(typeof listeners.gameState).toBe('function');
    listeners.gameState(state);

    // assert DOM updates
    const status = document.getElementById('status');
    expect(status.textContent).toMatch(/Players: 1/);
    const discard = document.getElementById('discardCount');
    expect(discard.textContent).toBe('1');
    const draw = document.getElementById('drawCount');
    expect(draw.textContent).toBe('3');
    const hand = document.getElementById('hand');
    expect(hand.textContent).toMatch(/A/);
  });
});
