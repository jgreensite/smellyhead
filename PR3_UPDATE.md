Update for PR #3 (feature/ui-improvements)

Summary of changes pushed:

- Wire 'Join as Local Player' button in `public/ui.js` to emit `addPlayer` and request game state.
- Show discard pile count (`#discardCount`) and draw pile count (`#drawCount`).
- Add simple face-up (`#faceUp`) and face-down (`#faceDown`) visuals.
- Expose `window.smellyHeadUI.renderGame` for tests and manual rendering.
- Add integration test `__tests__/ui.integration.test.js` which mocks socket.io and verifies join + render flow.

Validation:

- Ran full test suite locally: all tests pass (66 passed).
- Added `render.yaml` to configure Render services for production (`main`) and test (`feature/ui-improvements`) on the free tier.

Notes:

- I force-pushed the rebased `feature/ui-improvements` branch to `origin` to update PR #3.
- CI should run automatically for this branch/PR. If you want, I can open the PR in the browser or update the PR body directly.
