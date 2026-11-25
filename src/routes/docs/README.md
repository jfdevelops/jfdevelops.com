# Docs routes

All documentation UI and runtime code lives beside the docs routes.

```
docs/
  index.tsx                      # /docs catalog
  -components/                   # shared docs UI (status, layout, mdx, reader)
  -utils/                        # shared snapshot client/runtime + library registry
  react-layout/                  # dedicated library routes
  multi-step-form/
  create-error/
  cli/
  skills/
```

Each library folder is a thin binder that hardcodes the library id and reuses the
shared loader/page. Catalog metadata stays in `-utils/libraries.ts`. Snapshots
keep Twoslash hover types and load from the `jfdevelops-docs` R2 bucket. See
[docs/site-docs.md](../../../docs/site-docs.md).
