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
    docs/          # Docs routes; shared -components/-utils, $package dynamic route
  components/      # Shared site UI
packages/
  <package>/docs/  # Legacy placeholders; not consumed
public/
  brand/            # Active logo and app icon assets
```

## Docs architecture

Library repositories are registered in `src/routes/docs/-utils/libraries.ts` with their main branch. A scheduled
GitHub workflow generates Fumadocs snapshots and publishes them to the docs-content branch.
The deployed Worker loads library metadata and requested pages on demand, serves cached HTML,
and refreshes pointers in the background. R2 is not used. Normal dev/test/build commands do
not generate docs. Only UI/runtime changes and repository-list changes require deployment.
See docs/site-docs.md. Frameworks, versions and navigation come from library metadata.
Keep Framework above Version; companion packages remain ordinary plugin/devtools pages.

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

- Add real packages under `packages/` with `docs/` directories
- Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub secrets for CI deploys
- Install CodeRabbit GitHub App on the repository
- Wire contact form to a server function or external service
- Replace `example-package` placeholder docs with real package content

<!-- jfdevelops:start -->

## jfdevelops skills

Read each skill before the work it describes:

- [jf-coding-conventions](.agents/skills/jf-coding-conventions/SKILL.md): Apply jfdevelops coding conventions when implementing or reviewing JavaScript, TypeScript, or React code. Read before editing code; use the target project's toolchain and framework.
- [jf-docs](.agents/skills/jf-docs/SKILL.md): Write, edit, move, or review user-facing library documentation in jfdevelops projects, including guides, installation and quick-start pages, migration guides, versioned docs, docs for a new major, frontmatter, and links. Read before any docs change, even when the request only says to document a feature or update a guide.
- [jf-git](.agents/skills/jf-git/SKILL.md): Follow repository Git conventions before initializing history, naming or switching branches, staging changes, writing commits, or creating and updating pull requests.
- [jf-naming-conventions](.agents/skills/jf-naming-conventions/SKILL.md): Choose names for files, directories, packages, functions, types, and public APIs in jfdevelops projects. Read before adding or renaming these elements.

<!-- jfdevelops:end -->
