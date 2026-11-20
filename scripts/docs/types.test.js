import { describe, expect, it } from 'vitest'
import { annotateCodeBlocks } from './types.mjs'

describe('type-hover code block preparation', () => {
  it('marks TypeScript fences after normalizing Windows line endings', () => {
    const input = '```tsx\r\nconst value = 1\r\n```\r\n'
    expect(annotateCodeBlocks(input, 'library/react/v2')).toBe(
      '```tsx docs-types=library/react/v2\nconst value = 1\n```\n',
    )
  })
  it('leaves shell commands and opted-out snippets unmarked', () => {
    const input = '```sh\npnpm add example\n```\n```ts no-twoslash\nconst value = 1\n```'
    expect(annotateCodeBlocks(input, 'library/react/v2')).toBe(input)
  })
  it('does not interpret an inner fence in a text example as a new block', () => {
    const input = '````text\n```ts\nconst value = 1\n```\n````'
    expect(annotateCodeBlocks(input, 'library/react/v2')).toBe(input)
  })
  it('preserves illustrative query comments unless Twoslash is explicit', () => {
    const input = '```ts\nComponentTypes<typeof config>\n// ^? may resolve to a union\n```'
    expect(annotateCodeBlocks(input, 'library/react/v2')).toBe(input)
    expect(
      annotateCodeBlocks(input.replace('```ts', '```ts twoslash'), 'library/react/v2'),
    ).toContain('```ts twoslash docs-types=library/react/v2')
  })
})
