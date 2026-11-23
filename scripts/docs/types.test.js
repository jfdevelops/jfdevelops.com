import { describe, expect, it } from 'vitest'
import { annotateCodeBlocks } from './types.mjs'

describe('type-hover code block preparation', () => {
  it('groups authored package-manager commands without duplicating generated alternatives', () => {
    const input = ['npm', 'pnpm', 'yarn', 'bun']
      .map((manager) => `\`\`\`${manager}\n${manager} command\n\`\`\``)
      .join('\n\n')
    const output = annotateCodeBlocks(input, 'library/react/v1')
    for (const manager of ['npm', 'pnpm', 'yarn', 'bun']) {
      expect(output).toContain(`bash tab="${manager}" tab-group="package-manager"`)
      expect(output).toContain(`${manager} command`)
    }
    expect(annotateCodeBlocks('```npm\nnpm i library\n```', 'library/react/v1')).toBe(
      '```npm\nnpm i library\n```',
    )
    expect(annotateCodeBlocks('```pnpm\npnpm add library\n```', 'library/react/v1')).toBe(
      '```bash\npnpm add library\n```',
    )
  })
  it('marks TypeScript fences after normalizing Windows line endings', () => {
    const input = '```tsx\r\nconst value = 1\r\n```\r\n'
    expect(annotateCodeBlocks(input, 'library/react/v2')).toBe(
      '```tsx docs-types=library/react/v2\nconst value = 1\n```\n',
    )
  })
  it('types every script fence, including previously opted-out snippets', () => {
    const input = '```sh\npnpm add example\n```\n```ts no-twoslash\nconst value = 1\n```'
    expect(annotateCodeBlocks(input, 'library/react/v2')).toContain(
      '```ts docs-types=library/react/v2',
    )
  })
  it('does not interpret an inner fence in a text example as a new block', () => {
    const input = '````text\n```ts\nconst value = 1\n```\n````'
    expect(annotateCodeBlocks(input, 'library/react/v2')).toBe(input)
  })
  it('marks script snippets containing illustrative query comments', () => {
    const input = '```ts\nComponentTypes<typeof config>\n// ^? may resolve to a union\n```'
    expect(annotateCodeBlocks(input, 'library/react/v2')).toContain('docs-types=library/react/v2')
    expect(
      annotateCodeBlocks(input.replace('```ts', '```ts twoslash'), 'library/react/v2'),
    ).toContain('```ts twoslash docs-types=library/react/v2')
  })
})
