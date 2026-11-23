import { existsSync, readFileSync } from 'node:fs'
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins'
import { defineConfig } from 'fumadocs-mdx/config'
import { transformerTwoslash } from 'fumadocs-twoslash'
import { createFileSystemTypesCache } from 'fumadocs-twoslash/cache-fs'

const typeContexts: Array<{
  key: string
  cacheKey: string
  cwd: string
  compilerOptions: Record<string, unknown>
}> = existsSync('src/docs/generated-type-contexts.json')
  ? JSON.parse(readFileSync('src/docs/generated-type-contexts.json', 'utf8'))
  : []

function createTypeTransformer(context: (typeof typeContexts)[number]) {
  function matches(meta: string, language: string) {
    return (
      ['ts', 'tsx', 'typescript', 'js', 'jsx', 'javascript'].includes(language) &&
      meta.split(/\s+/).includes(`docs-types=${context.key}`)
    )
  }
  const transformer = transformerTwoslash({
    filter: (language, _code, options) => matches(options.meta?.__raw ?? '', language),
    twoslashOptions: {
      cwd: context.cwd,
      compilerOptions: context.compilerOptions,
      // Partial examples still get inferred types without being presented as compiler tests.
      handbookOptions: { noErrors: true, noErrorValidation: true },
    },
    typesCache: createFileSystemTypesCache({ dir: `.docs-cache/twoslash/v4/${context.cacheKey}` }),
  })
  // Each version owns its analysis and rendering; other versions must not process its hover nodes.
  return {
    ...transformer,
    tokens(tokens) {
      if (matches(this.options.meta?.__raw ?? '', this.options.lang))
        return transformer.tokens?.call(this, tokens)
    },
    pre(node) {
      if (matches(this.options.meta?.__raw ?? '', this.options.lang))
        return transformer.pre?.call(this, node)
    },
    code(node) {
      if (matches(this.options.meta?.__raw ?? '', this.options.lang))
        return transformer.code?.call(this, node)
    },
  } satisfies ReturnType<typeof transformerTwoslash>
}
// Match the library checker's heading IDs, including duplicate suffixes.
const headingCounts = new WeakMap<object, Map<string, number>>()
export default defineConfig({
  mdxOptions: {
    remarkImageOptions: false,
    remarkNpmOptions: { persist: { id: 'package-manager' } },
    rehypeCodeOptions: {
      themes: { light: 'github-light', dark: 'github-dark' },
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        ...typeContexts.map(createTypeTransformer),
      ],
    },
    remarkHeadingOptions: {
      slug(root, _heading, text) {
        let seen = headingCounts.get(root)
        if (!seen) {
          seen = new Map()
          headingCounts.set(root, seen)
        }
        const base = text
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s_-]/gu, '')
          .trim()
          .replace(/\s/g, '-')
        const count = seen.get(base) ?? 0
        seen.set(base, count + 1)
        return count === 0 ? base : `${base}-${count}`
      },
    },
  },
})
