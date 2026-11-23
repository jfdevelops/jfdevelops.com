# Docs routes

All documentation UI and runtime code lives beside the docs routes.

```
docs/
  index.tsx                      # /docs catalog
  -components/                   # shared docs UI (status, layout, mdx)
  -utils/                        # shared snapshot client/runtime
  $package/
    index.tsx / $.tsx            # package docs routes
    -components/                 # package-private UI (page, shell, selectors)
    -utils/                      # package-private loader
```

`-components` / `-utils` use TanStack Router's non-route directory prefix.
Package-only files stay under `$package/`; shared catalog/runtime files stay at
the docs root. Snapshots keep Twoslash hover types and load from the
`docs-content` branch. See [docs/site-docs.md](../../../docs/site-docs.md).
