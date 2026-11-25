# Runtime documentation

The website uses Fumadocs HomeLayout, DocsLayout, MDX components, code tabs and
Twoslash popups. Documentation content is loaded on demand from public GitHub
snapshots. R2 is not used. Route UI, MDX/Twoslash components, and the snapshot runtime live under
`src/routes/docs/`: shared pieces in `-components/` / `-utils/`, plus a single
`$package` dynamic route whose package param is validated against the
react-layout docs resource vocabulary. Snapshot generate outputs stay under
`.docs-cache/generated/`.

## Repository list

`src/routes/docs/-utils/libraries.ts` is the single registry for docs libraries:
presentation metadata, npm package name, GitHub repository, and snapshot wiring.
Frameworks, versions, defaults, navigation and page titles come from the
library-generated schema-v2 manifest. Adding a repository changes this allowlist
and requires a website deployment. New pages and versions in an existing
repository do not.

## What happens on a page request

The Worker loads a small current-snapshot pointer, that library's metadata, and the
requested page. It does not fetch every documentation page, install dependencies,
run library scripts, or execute downloaded JavaScript. Pointer checks are cached
for 60 seconds. Stale pointers remain usable for seven days while a refresh runs
through `waitUntil`. A failed refresh keeps the last validated pointer. A temporary
page fetch failure can fall back to the previous snapshot.

Immutable metadata and page JSON are cached by content revision. Complete public
HTML is cached by URL, snapshot and UI deployment ID. Browsers revalidate HTML.
Cookies, authorization, Set-Cookie responses, errors and snapshot mismatches bypass
the shared HTML cache. Unknown repositories and pages are never fetched as arbitrary
URLs.

Cloudflare caches are data-center-local and may be evicted. A genuinely cold request
still needs GitHub access; a cache is not permanent offline storage. Normal warm
requests serve server-rendered content without a browser loading spinner.

## How snapshots update

`Refresh GitHub docs snapshots` checks the repository list on a five-minute GitHub
Actions schedule, on relevant site changes, and through workflow_dispatch. Scheduled
runs can be delayed by GitHub. It resolves each repository's exact main SHA and skips
unchanged sources. It never deploys the website or publishes to R2.

When content changes, the workflow runs the library's docs generator/checker and
Fumadocs MDX compiler. TypeScript inference runs against the library source and
dependencies in this build environment. Fumadocs output is serialized to a validated
React render tree: component names, text, safe props, highlighted tokens, and type
information. The deployed viewer maps those names to its own Fumadocs components.
It does not evaluate MDX code in a request.

All immutable pages and metadata are committed together to the website repository's
`docs-content` branch. A current pointer identifies the complete snapshot and its
source commit. The site checks this pointer at runtime, independently of its own
deployment. Old snapshots stay available for readers and fallback. Pull requests
generate and upload a test artifact but cannot publish pointers.

The first merged run bootstraps the docs-content branch. Until a registered library
has a successful snapshot, its docs are unavailable rather than served from fabricated
metadata. GitHub outages at a cold location may also make docs temporarily unavailable.

## Development and checks

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm typecheck
pnpm build
```

Local development serves ignored snapshots automatically. The first `pnpm dev` prepares
missing snapshots, which can take several minutes; subsequent starts reuse them.
Tests and website builds do not generate or bundle library docs. To refresh local content:

```sh
pnpm docs:snapshot
```

This writes ignored .docs-snapshots files. It does not push them. The publishing workflow
owns the GitHub commit. Generated source checkouts, type caches and MDX collections stay
ignored as well. Updating rendering components or runtime behavior needs a site
deployment; editing an existing library's docs only needs a successful automatic refresh.

No extra server or environment setting is required for local docs. An optional
`VITE_DOCS_SNAPSHOT_ORIGIN` can point to an existing loopback snapshot server.
This override is available only in development and is ignored in production.

## Type-hover context

Every JavaScript and TypeScript fence is analyzed, including fences that previously
opted out. The importer resolves public API imports and carries dependencies from
other snippets on the same page into a hidden compiler prelude. Each displayed
fragment remains its own module so repeated example variable names do not conflict.

A fragment that relies on application-specific setup needs that real setup to infer
its types. Libraries can supply a sibling `<page>.context.tsx` file with the imports
and declarations used by their examples; it refreshes with their docs. Existing
site compatibility contexts live under `docs/type-contexts/<library>/<framework>/<version>`.
These are actual public API calls checked by TypeScript, never hand-written tooltip
labels. Use self-contained examples or context files for accurate inference; an
undefined identifier has no type information for an editor or the docs to display.

## Catalog presentation

Register docs libraries in `src/routes/docs/-utils/libraries.ts` with
`registerLibraryGroups` / `addLibrary` (`packageName`, `title`, `description`,
`icon`, `repository`, optional `docs`). Library ids and urls are derived from
`packageName`.

Version labels come from the library repository's git tags, read at request time and
cached for five minutes: `<packageName>@<version>` tags in monorepos, `v<version>`
otherwise. Cards show the latest release; the sidebar shows the latest release in the
selected major. A library with no matching tags shows no version. Frameworks, versions,
and page navigation still come from library docs snapshots.

Documentation images use commit-addressed `/docs-assets/` URLs. The Worker caches
public repository image bytes and serves their correct MIME type, including SVG;
SVG responses are sandboxed and never treated as executable site documents.
