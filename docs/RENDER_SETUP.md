Render setup & GitHub Secrets

This project includes a `render.yaml` and a GitHub Action that can trigger Render deploys. To complete automated deploys you must create an API key in Render and add a few secrets to GitHub.

Steps:

1. Create a Render API key
   - Sign in to https://render.com → Account → API Keys → New API Key.
   - Copy the generated key.

2. Find your Render Service IDs
   - In Render, open the service page (e.g., `smellyhead-prod`), and note the service ID from the URL: `/services/<SERVICE_ID>/...` or from the service settings page.
   - You need the service ID for production and the test service.

3. Add GitHub repository secrets
   - In GitHub: Settings → Secrets and variables → Actions → New repository secret
   - Add these secrets:
     - `RENDER_API_KEY` — the API key you created in step 1
     - `RENDER_SERVICE_ID_PROD` — the service ID for `smellyhead-prod`
     - `RENDER_SERVICE_ID_TEST` — the service ID for `smellyhead-test`

4. Confirm workflow
   - The repo contains `.github/workflows/deploy-to-render.yml`. It triggers on pushes to `main` (prod) and other branches (test).
   - The Render services are defined in `render.yaml` and configured to use `npm ci` for builds.

Recommended build and start commands for parity across environments

- If your Render service has separate Install and Build fields (preferred):
  - Install command: npm ci
  - Build command: npm run build --if-present
  - Start command: npm start

- If Render only exposes a single Build field for your environment, use:
  - Build command: npm ci && npm run build --if-present
  - Start command: npm start

Why:
- `npm ci` installs deterministically from package-lock.json and is the same command used by CI.
- `npm run build --if-present` runs your build step if you have one; it keeps parity with production builds without failing when no build script exists.

CI mirroring:
- The GitHub Actions CI workflow now runs `npm ci && npm run build --if-present` in a dedicated build validation step so the CI build matches Render's build process.

Notes and recommended values
 - Prefer `npm ci` in CI and Render builds for deterministic installs (this repo now uses `npm ci` in `render.yaml`).
 - Keep Render auto-deploy enabled if you want Render to deploy on push directly. The workflow provided is optional and triggers Render via API.

If you prefer, paste the Render API key here (or grant me access) and I can complete the service creation and secret configuration for you. Otherwise follow the steps above and the CI will trigger deploys after you add the secrets.
