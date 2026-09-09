---
title: Configuration
description: Tune validation rules for your application.
order: 2
---

# Configuration

The default rules are designed to work without setup. Add a configuration only when your application needs a deliberate exception.

## Rule levels

Each rule can be configured as `off`, `warn`, or `error`.

```ts
export default {
  rules: {
    'require-main-region': 'error',
    'prefer-labelled-navigation': 'warn',
  },
}
```

Keep exceptions narrow and leave a short explanation next to any disabled rule.
