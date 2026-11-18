import { z } from 'zod'

export const libraryIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
export const slugSchema = z.string().regex(/^[a-z0-9-]+(?:\/[a-z0-9-]+){0,3}$/)
export const snapshotSchema = z.string().regex(/^[a-f0-9]{64}$/)
const navigationSchema = z.array(z.object({ title: z.string(), pages: z.array(slugSchema) }))
const pageMetadataSchema = z.object({
  slug: slugSchema,
  pageId: slugSchema,
  version: libraryIdSchema,
  title: z.string(),
  description: z.string(),
  order: z.coerce.number().finite(),
  group: z.string(),
  headings: z.array(z.string()),
  previous: slugSchema.nullable(),
  next: slugSchema.nullable(),
})
export const pageSchema = pageMetadataSchema.extend({ content: z.string(), html: z.string() })
const versionSchema = z.object({
  id: libraryIdSchema,
  label: z.string(),
  status: z.enum(['current', 'previous', 'legacy', 'next']),
  note: z.string().nullable().optional(),
  path: z.string(),
  package: z.object({ name: z.string(), endpointVersion: z.string() }),
  source: z.object({ commit: z.string().nullable() }),
  examples: z.object({ verification: z.enum(['typechecked', 'adapted-from-source']) }),
  navigation: navigationSchema,
  channel: z.string(),
  docsSource: z.object({ commit: z.string(), branch: z.string().nullable() }),
})
export const librarySchema = z
  .object({
    id: libraryIdSchema,
    name: z.string(),
    description: z.string(),
    version: z.string(),
    defaultVersion: libraryIdSchema,
    versions: z.array(versionSchema),
    pageExists: z.record(z.string(), z.array(slugSchema)),
    pages: z.array(pageSchema),
  })
  .superRefine((library, context) => {
    const slugs = new Set(library.pages.map((page) => page.slug))

    if (slugs.size !== library.pages.length || !slugs.has(library.defaultVersion)) {
      context.addIssue({ code: 'custom', message: 'Duplicate pages or missing default index' })
    }

    for (const version of library.versions) {
      for (const id of version.navigation.flatMap((group) => group.pages)) {
        const slug = `${version.id}${id === 'index' ? '' : `/${id}`}`

        if (!slugs.has(slug)) {
          context.addIssue({ code: 'custom', message: `Missing navigation page ${slug}` })
        }
      }
    }
  })
export const summarySchema = z.object({
  id: libraryIdSchema,
  name: z.string(),
  description: z.string(),
  version: z.string(),
  defaultVersion: libraryIdSchema,
  versions: z.array(versionSchema),
  pageExists: z.record(z.string(), z.array(slugSchema)),
  pages: z.array(pageMetadataSchema),
})
export const pointerSchema = z.object({
  schemaVersion: z.literal(1),
  library: libraryIdSchema,
  snapshot: snapshotSchema,
})
export type DocPage = z.infer<typeof pageSchema>
export type PackageDocs = z.infer<typeof summarySchema>
