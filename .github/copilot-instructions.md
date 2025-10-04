## Purpose

Short, actionable guidance for AI coding agents working on this repository. Focus on where the game state lives, how state transitions happen, and how the UI and tests interact with the server.

## Quick project orientation

- Node.js app (no bundler). Static UI served from `public/` by `server.js`.
- Real-time layer: Socket.IO (server in `server.js`, client in `public/ui.js`).
- Game logic: in `src/` — state, state-machine, rules, deck, player.
- Tests: Jest in `__tests__/` (uses `jest-environment-jsdom` for UI-related tests).

## Key files / responsibilities

- `server.js` — Express static server + Socket.IO. Builds per-player UI payloads in `getPlayerGameState()` and emits `updateUI`, `yourTurn`, `notYourTurn`.
- `src/gameState.js` — singleton in-memory `gameState`. Properties you will read/mutate: `players`, `drawPile`, `discardPile`, `graveyardPile`, `currentPlayerIndex`, `direction`, rule flags (`even`, `lowerthan`, `suit`, `fastPlayActive`). Exported helpers: `createGame()` and `gameState`.
- `src/stateMachine.js` — `changeGameState` object with named states: `waitingForPlayers`, `setupGame`, `gameInProgress`. Mutations and the canonical transition map live here. Use its methods (e.g. `changeGameState.waitingForPlayers.addPlayer`) rather than replacing the singleton.
- `src/gameRules.js` — `canPlayCard`, `postPlayPowers`, and discard clearing logic. It reads/writes `gameState` directly. Special card semantics (2, 4, 6, 7, 10, J, Joker) are implemented here.
- `src/deck.js`, `src/player.js` — small value-type classes (Deck builds cards, Card values; Player stores `socketId`, `hand`, `faceUpCards`, `faceDownCards`).
- `public/` — client UI and socket client code. Look at `public/ui.js` for the client-side event contract.
- `__tests__/` — examples of how tests interact with the server and game state.

## Runtime & developer workflows

- Run tests: `npm test` (runs Jest). Many tests assume `NODE_ENV=test` and the test environment will bypass certain turn checks (see `gameInProgress.prePlayCard`).
- Lint: `npm run lint` (ESLint).
- Run server locally for manual UI testing: `node server.js` (defaults to PORT=3000). The `server.listen` wrapper will fall back to an ephemeral port if 3000 is in use — tests rely on this behavior.

## Socket / API contract (server ↔ client)

Client-emitted events (handled in `server.js`):
- `addPlayer` — server will call `changeGameState.waitingForPlayers.addPlayer(socket.id)` and reply with `playerAdded`.
- `startGame` — kicks `changeGameState.waitingForPlayers.startGame(socketId)`.
- `playCard` — payload: `{ cardType: 'hand'|'faceUp', cardIndex: number }`. Server validates and routes to `changeGameState.gameInProgress.prePlayCard`.
- `drawCard` — server draws from `drawPile` into the player's hand if available.

Server-emitted events (observe in `public/ui.js`):
- `updateUI` — per-player payload created by `getPlayerGameState()`; includes `myHand`, `faceUpCards`, `faceDownCards`, `otherPlayersCards`, `drawPile`, `discardPile`, `graveyardPile`, `playerCount`, `currentPlayer`, `currentRules`.
- `yourTurn` / `notYourTurn` — simple turn notifications.

## Project-specific conventions & gotchas

- Single in-memory game instance: many modules directly import and mutate the exported `gameState` singleton. Avoid creating alternate, out-of-band game instances unless you also update callers/tests.
- State transitions are centralized in `changeGameState.transition(newState)`. `isValidTransition` enforces allowed transitions; invalid transitions throw.
- Turn enforcement is skipped when running under tests. See `const isTestEnv = process.env.NODE_ENV === 'test' || typeof jest !== 'undefined'` in `stateMachine.js`.
- `gameRules.postPlayPowers` both reads and mutates `gameState` (resets flags and applies special-card behaviors). Use that function to keep consistent rule effects.
- Tests rely on `server.listen`'s EADDRINUSE fallback to an ephemeral port. Avoid changing that wrapper unless you update tests.

## Examples to copy/paste when editing code/tests

- Add a player (server-side):
  - `changeGameState.waitingForPlayers.addPlayer(socketId)`
- Check if it's a player's turn: `gameState.isPlayerTurn(socketId)` or `gameState.getCurrentPlayer()`
- Emit per-player UI: `io.to(player.socketId).emit('updateUI', getPlayerGameState(player.socketId))` (see `server.js`).

## Where to add features / UI hooks

- New socket events: add handlers inside `io.on('connection', ...)` in `server.js` so they participate in the same per-connection context and `getPlayerGameState` flow.
- New game rules: extend `src/gameRules.js` and make sure `postPlayPowers` updates `gameState` appropriately. Tests in `__tests__/` show expected behaviors and are a good template.

## Tests & debugging tips

- Run a single test file: `npx jest __tests__/some.test.js`.
- For tests that require server start, use the repository's existing pattern: call `require('../server').server.listen(...)` — the listen wrapper prevents EADDRINUSE failures during parallel runs.
- Use `console.log` in `server.js` / `stateMachine.js` / `gameRules.js` to trace runtime state changes during manual testing. The test suite already expects readable log output in a few places.

---

If anything above is unclear or you want more examples (for instance, sample unit test scaffolds or a walkthrough of a typical play flow) tell me which section to expand and I'll iterate.
