# Docs routes

All documentation UI and runtime code lives here.

```
docs/
  index.tsx                 # /docs catalog (HomeLayout)
  $package/                 # /docs/:package and splat pages
  -components/              # Fumadocs layouts, MDX components, Twoslash UI
  -utils/                   # Catalog, registry helpers, snapshot client/runtime
```

Content is not bundled into the Worker. Snapshots are compiled with Twoslash
hover types and loaded at request time from the `docs-content` branch. See
[docs/site-docs.md](../../../docs/site-docs.md).
