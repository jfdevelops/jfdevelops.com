# Runtime documentation

The website uses Fumadocs HomeLayout, DocsLayout, MDX components, code tabs and
Twoslash popups. Documentation content is loaded on demand from snapshots in the
`jfdevelops-docs` R2 bucket (Worker binding `DOCS_SNAPSHOTS`). Route UI, MDX/Twoslash components, and the snapshot runtime live under
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
run library scripts, or execute downloaded JavaScript. The pointer is read from R2
on every request, so a newly published snapshot is live on the next request. R2 reads
are strongly consistent, unlike a CDN or KV. A new pointer's manifest is validated
before it is used. If R2 cannot be read or the new snapshot is invalid, the last
validated pointer from the cache is used. A temporary page read failure can fall back
to the previous snapshot.

Immutable metadata and page JSON are cached by content revision. Complete public
HTML is cached by URL, snapshot and UI deployment ID. Browsers revalidate HTML.
Cookies, authorization, Set-Cookie responses, errors and snapshot mismatches bypass
the shared HTML cache. Unknown repositories and pages are never fetched as arbitrary
URLs.

Cloudflare caches are data-center-local and may be evicted. A genuinely cold request
still needs R2 access; a cache is not permanent offline storage. Normal warm
requests serve server-rendered content without a browser loading spinner.

## How snapshots update

`Refresh GitHub docs snapshots` runs when a library repository sends a `docs-updated`
repository dispatch on push to main, on relevant site changes, through
workflow_dispatch, and on a five-minute schedule as a backstop. GitHub delays and
drops scheduled runs, so the dispatch is what makes updates prompt. The workflow reads
the published pointers from R2, resolves each repository's exact main SHA and skips
unchanged sources. It never deploys the website.

When content changes, the workflow runs the library's docs generator/checker and
Fumadocs MDX compiler. TypeScript inference runs against the library source and
dependencies in this build environment. Fumadocs output is serialized to a validated
React render tree: component names, text, safe props, highlighted tokens, and type
information. The deployed viewer maps those names to its own Fumadocs components.
It does not evaluate MDX code in a request.

Immutable pages and metadata are uploaded to R2 first, under
`<library>/snapshots/<revision>/`. Each library's `<library>/current.json` pointer is
written last, so readers never see a pointer to a partial snapshot. The site reads the
pointer at runtime, independently of its own deployment. Old snapshots stay available
for readers and fallback. Pull requests generate and upload a test artifact but cannot
publish pointers.

Until a registered library has a successful snapshot, its docs are unavailable rather
than served from fabricated metadata.

### One-time setup

- Create the `jfdevelops-docs` R2 bucket.
- Add repository secrets `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` (an R2 API token
  with Object Read & Write on that bucket) beside the existing `CLOUDFLARE_ACCOUNT_ID`.
- In each library repository, add a workflow that sends the dispatch on push to main,
  with a `DOCS_DISPATCH_TOKEN` secret that can trigger workflows in this repository:

```yaml
name: Notify docs
on:
  push:
    branches: [main]
jobs:
  notify-docs:
    runs-on: ubuntu-latest
    steps:
      - run: gh api repos/jfdevelops/jfdevelops.com/dispatches -f event_type=docs-updated
        env:
          GH_TOKEN: ${{ secrets.DOCS_DISPATCH_TOKEN }}
```

## Development and checks

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm typecheck
pnpm build
```

Local development serves ignored snapshots automatically over a loopback server instead
of R2. `pnpm dev` prepares snapshots that are missing or behind their library's main
branch, which can take several minutes; otherwise it reuses them.
Tests and website builds do not generate or bundle library docs. To refresh local content:

```sh
pnpm docs:snapshot
```

This writes ignored .docs-snapshots files. It does not publish them. The refresh workflow
owns publishing to R2. Generated source checkouts, type caches and MDX collections stay
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
