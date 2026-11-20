<!-- intent-skills:start -->
## Skill Loading

Before substantial work:
- Skill check: run `npx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# JF Develops — Agent Context

## Scaffolding

```bash
npx @tanstack/cli@latest create my-tanstack-app --agent --deployment cloudflare
```

The generated app was merged into the repository root (not kept in a subdirectory).

Follow-up Intent commands:

```bash
npx @tanstack/intent@latest install
npx @tanstack/intent@latest list
```

## Stack

- **Framework:** TanStack Start (React, blank starter)
- **Router:** TanStack Router (file-based routes in `src/routes`)
- **Data:** TanStack Query with SSR integration (`@tanstack/react-router-ssr-query`)
- **Forms:** TanStack Form (`@tanstack/react-form`)
- **Intent:** TanStack Intent skills installed for local package guidance
- **CLI:** TanStack CLI used for initial scaffold
- **Deployment:** Cloudflare Workers via `@cloudflare/vite-plugin` and `wrangler.jsonc`
- **Styling:** Tailwind CSS v4

## Project layout

```
src/
  routes/          # TanStack Router file routes
  docs/            # Docs registry and markdown rendering
  components/      # Shared UI
packages/
  <package>/docs/  # Legacy placeholder docs; not consumed
.docs-content/    # Generated public docs from pinned library repositories (ignored)
public/
  brand/            # Active logo and app icon assets
```

## Docs architecture

Library repositories and pinned commits are registered in `docs.sources.json`. `pnpm docs:generate`
fetches the commit into `.docs-cache/`, installs dependencies, runs the library's docs generator and
checker, and reads its generated schema-v2 `docs/docs.json` and `meta.json` navigation. Only public
framework/version content is copied into `.docs-content/` and compiled with Fumadocs MDX.
`packages/*/docs` placeholders and the old website-owned package groups are not consumed.

Routes:

- `/docs` — package index
- `/docs/$package` — redirects to the default framework/version
- `/docs/$package/$` — `<framework>/<version>/<page>`; framework/version root shows its first page

To add a library: register its repository and full commit SHA, then run `pnpm docs:generate` here.
Frameworks, versions, statuses, defaults and navigation must come from library-generated metadata.
Keep Framework above Version in the sidebar. Companion packages stay ordinary plugin/devtools pages.
See README.md's Library documentation section for the build and authoring workflow.

## Partner integrations

### Cloudflare (deployment)

- Config: `wrangler.jsonc`, `vite.config.ts` (`@cloudflare/vite-plugin`)
- Local deploy: `npm run deploy` (builds then `wrangler deploy`)
- CI/CD: `.github/workflows/ci.yml`
  - Pull requests: install, generate routes, test, build
  - Push to `main`: same checks, then deploy via `cloudflare/wrangler-action@v3`
- GitHub repository secrets (required for auto-deploy):
  - `CLOUDFLARE_API_TOKEN` — API token with **Edit Cloudflare Workers** permission
  - `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID
- Worker secrets: `wrangler secret put <NAME>` for server-side values
- Public vars: add under `vars` in `wrangler.jsonc`

No Cloudflare-specific env vars are required for the current blank app.

### CodeRabbit (code review)

- **Not** an in-app SDK — external GitHub App tooling only
- Config: `.coderabbit.yaml` (optional review preferences)
- Setup:
  1. Install the [CodeRabbit GitHub App](https://github.com/apps/coderabbitai)
  2. Grant access to this repository
  3. Reviews run automatically on pull requests

## Environment variables

None required for local development. When adding server features:

- Client-safe: prefix with `VITE_`
- Server-only: use `wrangler secret put` — never commit secrets

## Scripts

```bash
npm run dev          # Local dev server (port 3000)
npm run build        # Production build
npm run preview      # Preview production build
npm run deploy       # Build + deploy to Cloudflare Workers
npm run generate-routes  # Regenerate routeTree.gen.ts
npm run test         # Vitest
```

## Known gotchas

- TanStack Start requires Node `>=22.12.0` (engine warnings on older Node)
- Regenerate routes after adding route files: `npm run generate-routes`
- Docs are build-time bundled — new markdown requires a rebuild
- `routeTree.gen.ts` is generated; do not hand-edit

## Next steps

- Register library repositories and pinned commits in `docs.sources.json`
- Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub secrets for CI deploys
- Install CodeRabbit GitHub App on the repository
- Wire contact form to a server function or external service
- Remove legacy placeholder docs after the repository ingestion migration is accepted
