import type { Root } from 'fumadocs-core/page-tree'
import { expect, it } from 'vitest'
import { collapseFolders } from './tree'

it('closes nested folders unless they set defaultOpen', () => {
  const tree: Root = {
    name: 'Docs',
    children: [
      { type: 'page', name: 'Overview', url: '/docs/a' },
      {
        type: 'folder',
        name: 'Errors',
        children: [
          { type: 'folder', name: 'Nested', children: [] },
          { type: 'folder', name: 'Pinned', defaultOpen: true, children: [] },
        ],
      },
    ],
  }

  expect(collapseFolders(tree)).toMatchObject({
    children: [
      { type: 'page', name: 'Overview' },
      {
        name: 'Errors',
        defaultOpen: false,
        children: [
          { name: 'Nested', defaultOpen: false },
          { name: 'Pinned', defaultOpen: true },
        ],
      },
    ],
  })
})
