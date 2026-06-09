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
  <package>/docs/  # Per-package markdown injected at build time
public/
  logo.png         # JF Develops logo
```

## Docs architecture

Package docs live in `packages/<name>/docs/**/*.md` and are bundled via `import.meta.glob` in `src/docs/registry.ts`.

Routes:

- `/docs` — package index
- `/docs/$package` — package landing (`index.md`)
- `/docs/$package/$` — individual doc pages by slug

To add a package: create `packages/<name>/docs/` with markdown files, then rebuild.

## Partner integrations

### Cloudflare (deployment)

- Config: `wrangler.jsonc`, `vite.config.ts` (`@cloudflare/vite-plugin`)
- Deploy: `npm run deploy` (builds then `wrangler deploy`)
- Setup:
  1. `npm install -g wrangler` (or use project-local `npx wrangler`)
  2. `wrangler login`
  3. `npm run deploy`
- Secrets: `wrangler secret put <NAME>` for server-side values
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

- Add real packages under `packages/` with `docs/` directories
- Connect Cloudflare account and deploy
- Install CodeRabbit GitHub App on the repository
- Wire contact form to a server function or external service
- Replace `example-package` placeholder docs with real package content
