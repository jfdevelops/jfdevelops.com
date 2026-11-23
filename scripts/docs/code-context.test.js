import { expect, it } from 'vitest'
import { completeCodeBlocks, missingIdentifiers } from './code-context.mjs'

it('uses the compiler binder to distinguish unresolved identifiers from parameters and properties', () => {
  const missing = missingIdentifiers(
    'const page = factory({ resource: "users", name: (value) => value });',
  )
  expect([...missing]).toEqual(['factory'])
})

it('carries imports and dependent declarations into isolated fragments without duplicating target declarations', () => {
  const markdown =
    '```ts\nimport { define } from "library";\nconst builder = define({resources: ["users"]});\n```\n\n```tsx\nconst UsersPage = builder({resource: "users"});\n```'
  const completed = completeCodeBlocks(markdown)
  expect(completed).toContain('import { define } from "library";')
  expect(completed).toContain('// ---cut---\nconst UsersPage = builder')
  expect(completed.split('const UsersPage')).toHaveLength(2)
})

it('resolves fragment names against real public exports and explicit page setup', () => {
  const completed = completeCodeBlocks(
    '```tsx\nconst UsersPage = createResourceLayout({resource: "users"});\n```',
    {
      prelude:
        'import { defineResourceLayout } from "library"; const { createResourceLayout } = defineResourceLayout({resources: ["users"]});',
    },
  )
  expect(completed).toContain('const { createResourceLayout }')
  expect(completed).toContain('import { defineResourceLayout }')
  expect(completed).toContain('// ---cut---')
})

it('resolves Windows Markdown fences and ignores script fences nested inside text examples', () => {
  const input =
    '\x60\x60\x60tsx\r\nconst UsersPage = createResourceLayout({resource: "users"});\r\n\x60\x60\x60\r\n'
  expect(completeCodeBlocks(input, { prelude: 'const createResourceLayout = factory;' })).toContain(
    '// ---cut---',
  )
  const nested =
    '\x60\x60\x60\x60text\n\x60\x60\x60ts\nconst page = factory();\n\x60\x60\x60\n\x60\x60\x60\x60'
  expect(completeCodeBlocks(nested, { imports: { factory: 'library' } })).toBe(nested)
})
