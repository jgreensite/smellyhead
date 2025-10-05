# Deploying smellyhead to Render

This repository includes a `render.yaml` manifest that configures two services on Render:

- `smellyhead-prod` — production web service tied to the `main` branch.
- `smellyhead-test` — test/staging web service tied to the `feature/ui-improvements` branch.

Both are configured to use the free plan and run `node server.js` after installing dependencies.

How Render will build and run
1. Render will run the `buildCommand` (set to `npm install`).
2. Render will run the `startCommand` (`node server.js`).

Quick setup steps
1. In Render, choose "New" → "Import from GitHub" and select this repository.
2. Render will detect `render.yaml` and create the two services automatically. If the import doesn't create the services, manually create a Web Service for each branch using the same build/start commands.
3. No environment variables are required by default. If you add secrets later (API keys, etc.), configure them in the Render dashboard.

Promoting test -> prod (manual)
1. When `feature/ui-improvements` is ready to promote, merge it into `main` (create a PR and merge via GitHub).
2. After the merge, `smellyhead-prod` on Render (branch `main`) will redeploy automatically.

Automated promotion (optional)
- You can set up a GitHub Action that, on merge to `main`, triggers additional checks or calls the Render API to initiate rollouts. For a small project the manual merge is usually sufficient.

Notes and caveats
- Free-tier services on Render may sleep when idle and have limited concurrency. For continuous availability you may need a paid plan.
- If you change the `startCommand` (for example to use `npm start`), update `render.yaml` and redeploy.

If you'd like, I can add a tiny GitHub Action that pings the `smellyhead-test` service after successful CI to smoke-test the HTTP endpoint.
