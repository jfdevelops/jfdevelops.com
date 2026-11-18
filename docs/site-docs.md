# Published library docs

`docs.sources.json` owns the publication pin. Update its full commit SHA in a reviewed
website PR after the desired docs land on the library's default branch. The current
pin publishes React Layout v4 through v0. Companion packages are documented inside
these guides and never registered as libraries.

`pnpm docs:generate` fetches that exact commit into a temporary checkout, runs its
`scripts/check-docs.mjs` with errors forwarded to the console, requires manifest
schema version 1, and generates `src/docs/generated/registry.json` plus static
`public/docs-assets`. Generated files are ignored by Git. No docs content is fetched
at request time. The build, development command, tests and typecheck generate docs
before proceeding; a fetch or validation failure stops them. CI deploys only after
successful tests and build, leaving the previous Cloudflare deployment in place
when validation fails.

The build renderer uses MarkdownIt with raw HTML disabled and Highlight.js. Heading
IDs are supplied directly by the pinned checker, and generation verifies every
rendered heading against it. Source frontmatter is parsed by the same checker,
including CRLF normalization. All manifest navigation entries must render; no page
is skipped. Each version retains its manifest metadata, groups and page order.

The existing catch-all route serves version/page slugs, redirects explicit index
URLs, and returns 404 for unknown pages or versions. Switching versions preserves a
page and valid fragment; missing pages fall back to the version index with a notice.
Old repository-path redirect stubs are intentionally not published: this website
never served those paths.

Use `pnpm dev` and the configured Portless URL (`jfdevelops`) for local access.
Do not start a direct preview server. `pnpm test`, `pnpm typecheck` and `pnpm build`
validate the integration. Tests cover renderer behavior, every generated page,
version switching, heading parity and generation failures. No deployment is needed
to run these checks.
