---
title: Overview
description: Start building flexible React layouts.
order: 1
---

# React Layout

Composable React primitives for building application shells, split panes, and responsive page layouts without tying your UI to one design system.

> These docs use placeholder content while the package-owned documentation pipeline is connected.

## Why React Layout?

- **Composable** — combine focused primitives instead of configuring a monolithic component.
- **Responsive** — define how regions adapt without duplicating markup.
- **Unstyled** — bring your own classes, tokens, and component system.

## Quick example

```tsx
import { Layout, LayoutMain, LayoutSidebar } from '@jfdevelops/react-layout'

export function AppShell() {
  return (
    <Layout>
      <LayoutSidebar>Navigation</LayoutSidebar>
      <LayoutMain>Your application</LayoutMain>
    </Layout>
  )
}
```

Continue to [Getting started](/docs/example-package/getting-started) for installation and setup.
