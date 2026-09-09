---
title: Getting started
description: Install the package and create your first layout.
order: 2
---

# Getting Started

Install the package with your preferred package manager.

```bash
pnpm add @jfdevelops/react-layout
```

## Create a layout

Import the pieces you need and compose them in your application. Each component forwards DOM props, so styling stays in your hands.

```tsx
import { Layout, LayoutMain } from '@jfdevelops/react-layout'

export function Dashboard() {
  return <Layout><LayoutMain>Dashboard content</LayoutMain></Layout>
}
```

## Next steps

- Add a sidebar or header region.
- Apply your project spacing and breakpoint tokens.
- Keep each layout region focused on one responsibility.
