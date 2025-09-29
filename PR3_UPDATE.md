Update for PR #3 (feature/ui-improvements)

Summary of changes pushed:

- Wire 'Join as Local Player' button in `public/ui.js` to emit `addPlayer` and request game state.
- Show discard pile count (`#discardCount`) and draw pile count (`#drawCount`).
- Add simple face-up (`#faceUp`) and face-down (`#faceDown`) visuals.
- Expose `window.smellyHeadUI.renderGame` for tests and manual rendering.
- Add integration test `__tests__/ui.integration.test.js` which mocks socket.io and verifies join + render flow.

Validation:

- Ran `npm run lint` and full test suite locally: all tests pass (35 passed).
- Updated `package.json` to include `jest-environment-jsdom` for the new integration test.

Notes:

- CI should run automatically for this branch/PR. If you want, I can open the PR in the browser or update the PR body directly.
