# Deploying smellyhead to Render

This repository includes a `render.yaml` manifest that configures two services on Render:

- `smellyhead-prod` — production web service tied to the `main` branch.
- `smellyhead-test` — test/staging web service tied to the `feature/ui-improvements` branch.

Both are configured to use the free plan and run `npm start` after installing dependencies (Render runs the `buildCommand` then the `startCommand`).

How Render will build and run
1. Render will run the `buildCommand` (set to `npm ci`).
2. Render will run the `startCommand` (`npm start`, which runs `node server.js`).

Quick setup steps
1. In Render, choose "New" → "Import from GitHub" and select this repository.
2. Render will detect `render.yaml` and create the two services automatically. If the import doesn't create the services, manually create a Web Service for each branch using the same build/start commands (see recommended values below).
3. No environment variables are required by default. If you add secrets later (API keys, etc.), configure them in the Render dashboard (do not store production secrets in preview environments).

Recommended values when creating a Render web service
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/` (the server serves the UI at root)
- Root Directory: leave blank (this repo is not a monorepo)
- Instance Type: Free or Starter depending on usage

Promoting test -> prod (manual)
1. When `feature/ui-improvements` is ready to promote, merge it into `main` (create a PR and merge via GitHub).
2. After the merge, `smellyhead-prod` on Render (branch `main`) will redeploy automatically.

Automated promotion (optional)
- You can set up a GitHub Action that, on merge to `main`, triggers additional checks or calls the Render API to initiate rollouts. For a small project the manual merge is usually sufficient.

Notes and caveats
- Free-tier services on Render may sleep when idle and have limited concurrency. For continuous availability you may need a paid plan.
- `npm ci` requires a `package-lock.json`. Make sure the lockfile is checked into the repo. `npm ci` is preferred in CI and on Render for deterministic installs.
- `server.js` reads `process.env.PORT` and the Render platform provides a port automatically.

If you'd like, I can add a tiny GitHub Action that pings the `smellyhead-test` service after successful CI to smoke-test the HTTP endpoint.

## Pull request (PR) previews

Render can automatically create ephemeral preview environments for pull requests. This is useful for QA, demos, and reviewing UI changes without affecting `smellyhead-test` or `smellyhead-prod`.

- Enablement: If "Always create PR previews" is enabled in your Render repo settings, a preview service will be created for every PR.
- Skip a preview: add the label `render-preview-skip` to the PR or include `[skip preview]` in the PR title to opt-out of a preview for that PR.

How to use previews
- After opening a PR, Render will create a preview service and (depending on your settings) post the preview URL in the PR checks or in a Render comment.
- Open the preview URL to test the branch-specific deployment. Use the Render Dashboard → Services → (preview service) → Logs to inspect build/runtime logs.

Secrets and environment variables for previews
- Do not reuse production secrets in preview environments. Create limited-scope or test credentials for previews.
- Configure preview-specific environment variables in Render where possible instead of copying production secrets.

Cleanup and cost management
- Previews are ephemeral. Configure automatic cleanup/retention in Render if available to avoid many long-lived preview services.

Troubleshooting
- If a preview build fails, check the build log for `npm ci` errors (missing or invalid `package-lock.json` will cause `npm ci` to fail).
- If the preview service fails to start, confirm the start command is `npm start` and that `server.js` correctly reads `process.env.PORT`.
