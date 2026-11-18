# R2 documentation publishing

The website is a docs viewer. Library documentation is published independently of
website deployments. Libraries own their manifest, navigation, versions, Markdown
and examples. New manifest pages, versions and libraries appear on the next docs
publication; no new viewer route or website build is required.

## Storage contract

The private R2 bucket is `jfdevelops-docs`, bound to the viewer as `DOCS_BUCKET`.
Publication schema version 1 uses these keys:

```text
libraries/<library>.json                     atomic current-snapshot pointer
snapshots/<library>/<sha256>/manifest.json   navigation and page metadata
snapshots/<library>/<sha256>/pages/<slug>.json
snapshots/<library>/<sha256>/assets/...
```

Every snapshot is content-addressed. The publisher validates the complete artifact,
uploads every page and asset, warms page HTML, and only then replaces the library's
pointer. An upload or warm failure leaves the previous pointer serving. Old snapshots
stay available for existing readers and rollback. Snapshot hashes include asset
bytes; image URLs are rewritten to immutable snapshot paths. Private R2 writers are
trusted publication identities; the bucket has no public write endpoint.

## Reader performance

The viewer server-renders the requested page, including highlighted code and static
type metadata. It never compiles examples or calls GitHub/npm while serving docs.
Immutable artifacts are cached at the edge; pointers refresh after 15 seconds.
Full HTML is cached by URL, snapshot and viewer deployment ID, so updates and viewer
deployments select new cache entries. Browsers revalidate HTML instead of keeping an
old snapshot for a day. Requests with cookies or authorization bypass shared HTML
caching, as do responses that set cookies. Sidebar links prefetch on hover/focus.
Code tooltips have zero delay and no entry animation.

Warming runs before pointer promotion using `x-docs-snapshot`, and verifies the
returned snapshot header. Immutable snapshots are public documentation, including
staged snapshots when their hash is known. A warm failure aborts promotion. Warming
reaches the publisher's Cloudflare location, not every location worldwide. Other
locations render on their first request; that request waits for server content and
normal network latency rather than showing a browser-side loading screen. The Cache
API requires the deployed custom domain; workers.dev does not provide equivalent
edge-cache behavior. The bare `/docs` library index is server-rendered from R2.

## Local development

```sh
pnpm install
pnpm docs:seed     # generate/validate/highlight, then populate local R2
pnpm dev           # Portless only; no docs regeneration on startup
```

Local publication and Vite share `.wrangler/state/v3`. `pnpm docs:publish` publishes
an already generated artifact locally. `.env.local` still needs the application's
existing `VITE_CONVEX_URL`. The website build and normal tests do not need a generated
docs registry. `pnpm cf-typegen` refreshes Worker binding types after config changes.

## Library CI

The reusable `.github/workflows/publish-docs.yml` runs generation and publication
without deploying the website. Call it from each library after docs changes pass CI,
or after a release has published. For example, in the library repository:

```yaml
name: Publish docs
on:
  push:
    branches: [main]
    paths: ['docs/**', 'scripts/check-docs.mjs', 'tools/docs/**']
  workflow_dispatch:
jobs:
  docs:
    uses: jfdevelops/jfdevelops.com/.github/workflows/publish-docs.yml@main
    with:
      sources: >-
        {"react-layout":{"repository":"https://github.com/jfdevelops/react-layout","description":"React Layout documentation.","defaultChannel":"stable","channels":{"stable":{"commit":"${{ github.sha }}"}}}}
    secrets:
      CLOUDFLARE_API_TOKEN: ${{ secrets.DOCS_CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

Pin the reusable workflow and its `viewer_ref` input to a reviewed website tooling
commit for stronger reproducibility. The token needs access to the docs bucket and
Workers remote binding sessions used by Wrangler. Publication runs are serialized per
caller repository. Keep one publication owner per library; deliberately publishing
an older snapshot is also the rollback mechanism. The workflow's default warm URL is
`https://jfdevelops.com`. It does not run the website deployment workflow, Convex
deployment, or `wrangler deploy`.

A site operator can run `DOCS_WARM_URL=https://jfdevelops.com pnpm docs:publish --remote`.
The initial seed, before the new viewer has been deployed, uses the explicit
`pnpm docs:publish --remote --bootstrap` exception to skip warming. After deploying
the viewer once, normal library publications require no website redeployment.

## Generation and channels

`pnpm docs:generate` resolves each configured branch or commit, runs the library's
checker and requires manifest schema version 1. It renders all manifest versions and
navigation entries and checks heading parity. `pnpm docs:verify` validates the result
against the publication contract. Unregistered folders fail the library checker;
they are not silently published. Companion packages remain inside library guides.

`docs.sources.json` is publisher configuration, not viewer configuration. Its default
channel imports all manifest versions. Optional additional branch channels can select
one source version, label it Alpha and publish an unreleased route. No alpha channel
is currently configured. Runtime discovery uses R2 pointers, not this file.

Shiki handles light/dark highlighting. Twoslash uses version-isolated declarations
and hidden earlier page declarations for partial snippets. Unresolved symbols get no
invented hover. Unpublished next versions still render with local inference. Npm
installation uses `--ignore-scripts`; isolated caches and lockfiles stay in ignored
`.cache/docs-types`. Tooltips render type/JSDoc strings as text. Library example
verification remains authoritative; hover inference does not replace its tests.

## Validation and rollout

`pnpm test`, `pnpm typecheck` and `pnpm build` validate the viewer without generating
or publishing docs. Publisher validation is separate: `pnpm docs:generate` followed
by `pnpm docs:verify`. Tests cover pointer promotion, failures, cache hits, revision
switches, staged warming, assets, keyboard/pointer tooltips and the content pipeline.

The bucket can be provisioned and seeded before deployment. Merge/deploy the stacked
viewer PR once to activate its R2 binding, then enable the library workflow above.
No library repository has been modified by this website change.
