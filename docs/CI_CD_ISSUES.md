# CI/CD / Render environment promotion: Issues, labels and next steps

## Current status (as of update)

- package-lock.json: added to repository to stabilize npm installs — done.
- ESLint lint failures: known unused import fixed in `features/steps/joinSteps.js` — done.
- Failing unit test: `src/gameRules.js` guard added to prevent TypeError — done.
- CI parity: CI now runs a build validation step (`npm ci && npm run build --if-present`) to mirror Render build behavior — done.
- Deploy workflows: `.github/workflows/deploy-to-render.yml` updated to split Test/Production, added secret-presence debug steps, and improved Render `curl` logging to capture HTTP status and response body — committed to `main`.
- create-ci-cd-issues workflow: YAML errors fixed (removed extraneous code fences) and permissions added in the workspace. The workflow file has not yet been pushed to `main` at the time of this update. See "Next steps" below to push and run it.

## Purpose

Capture the work items, labels, and concrete issue bodies needed to implement a robust PR preview → Test (UAT) → Production promotion flow using Render and GitHub Actions. You can copy/paste these into GitHub Issues, or use the `gh` commands provided below.

## Recommended labels

- CI/CD — CI and deployment work
- deploy — deployment related tasks
- infra — infrastructure and hosting
- uat — user acceptance testing
- preview — PR preview related
- needs-investigation — needs investigation
- documentation — docs and runbooks
- bug — bug
- enhancement — enhancement

## Suggested issues (titles, bodies, labels)

1) Implement dynamic Render preview discovery and remove RENDER_SERVICE_ID_TEST dependency
Labels: CI/CD, preview, infra
Body:
Motivation: Avoid maintaining a repo-level test service ID by discovering PR preview services dynamically using the Render API.

Acceptance criteria:
- Workflows can find the preview service ID and URL for a PR/branch.
- Deploy and preview workflows no longer require the RENDER_SERVICE_ID_TEST secret.
- pr-preview-smoke uploads services.json for diagnostics when discovery fails.

Implementation notes:
- Query Render API /v1/services and match by branch/PR or service name pattern.
- Add safe fallbacks and caching to avoid rate limits.
- Update pr-preview-smoke.yml and deploy-to-render.yml to use discovery and add tests.


2) Create Render test environment and document settings
Labels: CI/CD, infra, documentation
Body:
Create a dedicated Render test environment for UAT that mirrors production as closely as feasible.

Acceptance criteria:
- A Render service `smellyhead-test` exists with branch `main` auto-deploy enabled.
- Build command (when only a single Build field exists): `npm ci && npm run build --if-present` and Start command `npm start`.
- Health check configured and env vars mirrored from prod but pointing to test resources.
- Document exact UI fields and env var names in `docs/RENDER_SETUP.md`.


3) Add UAT workflow to run full E2E tests on test environment after merge to main
Labels: CI/CD, uat
Body:
Add a workflow that runs full end-to-end/UAT tests against the dedicated Render test environment when commits are pushed to main.

Acceptance criteria:
- Workflow triggers on push to main.
- Workflow discovers the test service URL via Render API (or uses RENDER_SERVICE_ID_TEST until discovery is implemented).
- Runs long-running E2E/UAT test suite and uploads artifacts on failure.
- Optionally gates production deploy using GitHub Environments approvals.


4) Configure GitHub Environments and protection rules for Production
Labels: CI/CD, infra
Body:
Create GitHub Environments (Test, Production) and configure environment secrets and required reviewers for deployments to production.

Acceptance criteria:
- Environment `Production` created and protected with required reviewers before deployment.
- Environment `Test` created with test secrets (RENDER_SERVICE_ID_TEST, DB_TEST_*, etc.).


5) Improve deploy logging and error handling for Render integration
Labels: CI/CD, infra
Body:
Improve the deploy workflows so that curl responses capture HTTP status and full JSON response (masked) on failures to aid debugging.

Acceptance criteria:
- Deploy workflow logs HTTP status code and response body when Render API responses are non-2xx.
- pr-preview-smoke uploads services.json when preview discovery fails to aid matching heuristics.


6) Replace repo-level test deploy secret usage with discovery logic (follow-up)
Labels: CI/CD, infra, preview
Body:
After discovery is implemented, remove reliance on RENDER_SERVICE_ID_TEST from workflows and read test service IDs dynamically.

Acceptance criteria:
- No use of RENDER_SERVICE_ID_TEST in workflows.
- Tests and workflows rely on discovery logic and documented fallbacks.


## Mapping existing issues

- #4 Infra: CI pipeline — map to CI/CD
- #5 Infra: BDD e2e — map to uat, CI/CD
- #10 Infra: Render smoke tests & monitoring — map to infra, deploy
- #17 Add lockfile — done; map to CI/CD
- #16 Document socket API — documentation


## How to create labels & issues (local CLI)

Use the GitHub CLI `gh` to create labels and issues locally (run these from a machine with `gh` authenticated):

# Create labels
gh label create "CI/CD" --description "CI and deployment work" --color 0E8A16
gh label create deploy --description "Deployment related tasks" --color 5319e7
gh label create infra --description "Infrastructure and hosting" --color 5319e7
gh label create uat --description "User acceptance testing tasks" --color fbca04
gh label create preview --description "PR preview related" --color c2e0c6
gh label create needs-investigation --description "Needs investigation" --color f9d0c4
gh label create documentation --description "Documentation tasks" --color 0e8a16
gh label create bug --description "Bug" --color b60205
gh label create enhancement --description "Enhancement" --color a2eeef

# Create the suggested issues (run one-by-one)
gh issue create --title "Implement dynamic Render preview discovery and remove RENDER_SERVICE_ID_TEST dependency" --body $'Motivation: Avoid maintaining a repo-level test service ID by discovering PR preview services dynamically using the Render API.\n\nAcceptance criteria:\n- Workflows can find the preview service ID and URL for a PR/branch.\n- Deploy and preview workflows no longer require the RENDER_SERVICE_ID_TEST secret.\n- pr-preview-smoke uploads services.json for diagnostics when discovery fails.\n\nImplementation notes:\n- Query Render API /v1/services and match by branch/PR or service name pattern.\n- Add safe fallbacks and caching to avoid rate limits.\n- Update pr-preview-smoke.yml and deploy-to-render.yml to use discovery and add tests.' --label "CI/CD"

gh issue create --title "Create Render test environment and document settings" --body $'Create a dedicated Render test environment for UAT that mirrors production as closely as feasible.\n\nAcceptance criteria:\n- A Render service `smellyhead-test` exists with branch main auto-deploy enabled.\n- Node build/start commands set to `npm ci && npm run build --if-present` and `npm start`.\n- Health check configured and env vars mirrored from prod but pointing to test resources.\n- Document exact UI fields and env var names in `docs/RENDER_SETUP.md`.' --label "CI/CD"

gh issue create --title "Add UAT workflow to run full E2E tests on test environment after merge to main" --body $'Add a workflow that runs full end-to-end/UAT tests against the dedicated Render test environment when commits are pushed to main.\n\nAcceptance criteria:\n- Workflow triggers on push to main.\n- Workflow discovers the test service URL via Render API (or uses RENDER_SERVICE_ID_TEST).\n- Runs long-running E2E/UAT test suite and uploads artifacts on failure.\n- Optionally gates production deploy using GitHub Environments approvals.' --label "CI/CD"


## Next steps / recommended immediate work (priority order)

1. Create GitHub Environments: Test and Production in the repo Settings → Environments.
2. Add environment-level secrets: move service IDs into environment secrets (RENDER_SERVICE_ID_TEST → Test, RENDER_SERVICE_ID_PROD → Production). Keep RENDER_API_KEY at repo-level or add to each environment if desired.
3. Ensure Actions workflow permissions: Settings → Actions → General → Workflow permissions set to "Read and write" so workflow tokens can create issues/labels.
4. Commit & push the fixed `create-ci-cd-issues.yml` and run it once via the Actions UI to populate labels & issues.
5. Implement dynamic preview discovery and remove RENDER_SERVICE_ID_TEST from workflows.
6. Add UAT workflow that runs long E2E tests against `smellyhead-test` and gates production deploys via environment approvals.


If you want I can:

- Commit & push the fixed `create-ci-cd-issues.yml` and re-run it, then report created issue URLs; or
- Run the label/issue creation commands locally via the GitHub CLI from this environment (requires `gh` and authentication); or
- Start implementing dynamic preview discovery in the `pr-preview-smoke` and `deploy-to-render` workflows (requires design decision).

Tell me which option to proceed with and I will act.
