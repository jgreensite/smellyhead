UI changes in feature/ui-improvements

- Wired 'Join as Local Player' button in `public/ui.js` to emit `addPlayer` and request game state.
- Added visual indicators: discard count (`#discardCount`), draw count (`#drawCount`), face-up (`#faceUp`) and face-down (`#faceDown`) displays.
- Exposed `window.smellyHeadUI.renderGame` for testing.
- Added integration test `__tests__/ui.integration.test.js` which mocks socket.io and exercises join + gameState rendering.

Polish:

- Added placeholders in `public/index.html` for discard/draw piles and moved controls into a compact `.controls` area.
- Added `public/ui.css` polish for piles, facedown visuals, and layout.

All tests pass locally (35 tests).
