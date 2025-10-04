# smellyhead

## Secrets management

This project stores deployment-related secrets in GitHub Actions repository secrets. Currently the workflows expect the following secrets to be set:

- `RENDER_API_KEY` — Render API key used by the deploy workflow to trigger deploys via Render's API.
- `RENDER_SERVICE_ID_PROD` — Render service ID for the production service (`smellyhead-prod`).
- `RENDER_SERVICE_ID_TEST` — Render service ID for the test/dev service (`smellyhead-test`).

Recommended ways to add repository secrets:

1) GitHub UI (recommended for non-CLI users)
	- Go to your repository → Settings → Secrets and variables → Actions → New repository secret.
	- Add each secret name and value.

2) GitHub CLI (convenient when automating)
	- Authenticate: `gh auth login`
	- Set a secret for the current repo:
	  ```bash
	  gh secret set RENDER_API_KEY --body "<your-render-api-key>"
	  gh secret set RENDER_SERVICE_ID_PROD --body "<prod-service-id>"
	  gh secret set RENDER_SERVICE_ID_TEST --body "<test-service-id>"
	  ```
	- Or target a specific repo: `--repo jgreensite/smellyhead`

Security notes
- Rotate the Render API key periodically and remove unused keys in Render's dashboard.
- Prefer repository-level secrets for repo-specific values. Use organization secrets when multiple repos share the same credentials.
- Keep secrets out of code and PR comments. Use GitHub Actions secrets or a secrets manager.

See `docs/RENDER_SETUP.md` for step-by-step Render instructions and how the repo's deploy workflow uses these secrets.

