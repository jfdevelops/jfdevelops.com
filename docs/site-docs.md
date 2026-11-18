# Library-owned documentation

The site is a rendering shell. Libraries own their `docs/docs.json` manifest,
page frontmatter, navigation, version directories, release status and examples.
Register a library once in `docs.sources.json`; each successful build publishes
all versions in its default channel's manifest. Adding a new version directory
and its manifest entry requires no site routes, version numbers or UI changes.
Unregistered directories fail the library checker instead of silently publishing
incomplete content. Companion packages remain inside their library's guides.

## Sources and channels

React Layout currently has one channel, `stable`, following its `main` branch.
No alpha channel is enabled. The default channel imports every manifest version,
including future versions marked `next`. The manifest controls display labels
(such as `v5 Alpha`) and the default released version.

Every channel specifies exactly one `branch` or full 40-character `commit`.
Branches resolve to immutable commit snapshots during generation; the resolved
SHA is recorded on every generated version and logged in CI. Use a commit when
docs must remain frozen until a reviewed website pin update.

An optional additional branch channel can select a version from another branch:

```json
{
  "some-library": {
    "repository": "https://github.com/owner/library",
    "description": "Library documentation.",
    "defaultChannel": "stable",
    "channels": {
      "stable": { "branch": "main" },
      "alpha": { "branch": "next", "label": "Alpha" }
    }
  }
}
```

This example is not active configuration. Additional channels publish the source
manifest's default version at `/docs/some-library/alpha`, use an unreleased banner,
and rewrite internal links and asset URLs to that channel. Set `version` to select
a particular source version instead. Route collisions fail generation.

## Build and refresh

`pnpm docs:generate` checks out each source, runs its `scripts/check-docs.mjs`,
requires manifest schema version 1, and generates the ignored
`src/docs/generated/registry.json` and `public/docs-assets`. All sources must pass
before outputs are replaced. CI builds this artifact; docs content is never
fetched at request time. Local dev, tests and typecheck also generate it first.

Branch changes become visible on the next website build. Website pushes and
manual `workflow_dispatch` already build. A library workflow can send a
`repository_dispatch` with event type `docs-updated` to this website after its docs
checks pass; this rebuilds the default branch. The sender needs a token permitted
to dispatch to the website repository. No sender credentials are stored here.
New directories alone do not trigger CI across repositories.

The source contract must continue to validate. A fetch, manifest, link, rendering
or heading-parity failure stops the build; CI deploys only after successful tests
and build, so the previous Cloudflare deployment continues serving.

## UI and validation

Docs compose a provider, shell, sidebar, version selector, navigation, breadcrumb,
notices, main content and pager. Layout components accept native element props;
interactive elements use this project's shadcn/Base UI primitives.

`pnpm test`, `pnpm typecheck` and `pnpm build` validate the integration. Run local
apps through `pnpm dev` and the configured Portless URL. Old repository-path stubs
remain unpublished because the website never served them.

## Highlighting and type hovers

All fenced code is highlighted with Shiki in light and dark themes at build time.
TS, TSX, JS and JSX snippets additionally run through Twoslash. Earlier complete
imports and declarations on the same page provide hidden context for subsequent
snippets; incomplete fragments are kept exactly as written. Hovers expose resolved
compiler information and JSDoc. Unresolved `any`/`unknown` symbols are omitted rather
than inventing library APIs. Syntax highlighting still works without JavaScript;
client-side shadcn tooltips add pointer and keyboard access to the static metadata.
Code tooltips use zero hover delay and no entry animation; opening one performs no
network request or compiler work.

Each release gets an isolated type environment. The core package uses the exact
manifest endpoint version, companion packages use the docs compatibility table or
pinned installation commands, and other imports use that published release's npm
metadata. The website's installed library version is never used for docs inference.
Npm installation runs with lifecycle scripts disabled. Environments and their npm
lockfiles live in ignored `.cache/docs-types`, keyed by dependencies and TypeScript
version, and are reused by subsequent build steps. Delete this cache to re-resolve
third-party dependency ranges. A cold build needs npm access as well as GitHub.
An unreleased channel with no published npm snapshot still builds with syntax
highlighting and locally inferable types. Missing library symbols get no hover;
there is no fallback to the website's package versions. Publishing a prerelease
provides the real declarations on the next build. A library-owned type fixture
contract could support unpublished APIs later.

Type inference is not a replacement for the library's example checks: partial
snippets deliberately suppress diagnostics, and the manifest's example-verification
banner remains authoritative. The page text and code never execute. Inferred type
and JSDoc strings are rendered as text in tooltips.

The full generated registry stays on the server. A page request receives its HTML
and shared navigation metadata, rather than every version's HTML. Navigation uses
the site's own server function; there are no runtime GitHub/npm requests or compiler
bundles in the browser or Worker.
