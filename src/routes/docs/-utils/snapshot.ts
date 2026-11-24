import type { Root } from 'fumadocs-core/page-tree'
import { z } from 'zod'

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

function isTree(value: unknown): value is Root {
  if (
    !value ||
    typeof value !== 'object' ||
    !('children' in value) ||
    !Array.isArray(value.children)
  )

    return false
  function node(value: unknown): boolean {
    if (!value || typeof value !== 'object' || !('type' in value)) return false
    if ('name' in value && typeof value.name !== 'string') return false
    if (value.type === 'page')

      return 'url' in value && typeof value.url === 'string' && value.url.startsWith('/docs/')
    if (value.type === 'separator') return true

    return (
      value.type === 'folder' &&
      'children' in value &&
      Array.isArray(value.children) &&
      value.children.every(node) &&
      (!('index' in value) || value.index == null || node(value.index))
    )
  }

  return value.children.every(node)
}

export type RenderNode =
  | string
  | number
  | null
  | RenderNode[]
  | {
      tag: string
      props: Record<string, Json>
      children: RenderNode[]
    }

export const renderNodeSchema: z.ZodType<RenderNode> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.null(),
    z.array(renderNodeSchema),
    z.object({
      tag: z.string().max(80),
      props: z.record(z.string(), z.json()),
      children: z.array(renderNodeSchema),
    }),
  ]),
)
const entry = z.object({
  id: z.string(),
  file: z.string(),
  title: z.string(),
  headings: z.array(z.string()),
})
const version = z.object({
  id: z.string().regex(/^v\d+$/),
  label: z.string(),
  status: z.enum(['current', 'previous', 'legacy', 'next']),
  path: z.string(),
  endpointVersion: z.string().nullable(),
  defaultPage: z.string(),
  pages: z.array(entry),
  tree: z.custom<Root>(isTree, 'Invalid documentation navigation tree'),
})
export const librarySchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string(),
  packageName: z.string(),
  description: z.string(),
  repository: z.url(),
  commit: z.string().regex(/^[a-f0-9]{40}$/),
  pageCount: z.number().int().nonnegative(),
  frameworks: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        title: z.string(),
        defaultVersion: z.string(),
        versions: z.array(version).min(1),
      }),
    )
    .min(1),
})
export const pointerSchema = z.object({
  schemaVersion: z.literal(1),
  revision: z.string().regex(/^[a-f0-9]{64}$/),
  sourceCommit: z.string().regex(/^[a-f0-9]{40}$/),
})
export const manifestSchema = z.object({
  schemaVersion: z.literal(1),
  sourceBranch: z.literal('main'),
  library: librarySchema,
})
export const pageSchema = z.object({
  schemaVersion: z.literal(1),
  framework: z.string(),
  version: z.string(),
  id: z.string(),
  title: z.string(),
  description: z.string(),
  body: renderNodeSchema,
  toc: z.array(z.object({ title: z.string(), url: z.string(), depth: z.number() })),
})
export type SnapshotPage = z.infer<typeof pageSchema>

