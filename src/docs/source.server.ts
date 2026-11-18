import { env } from 'cloudflare:workers'
import { getRequestHeader } from '@tanstack/react-start/server'
import { createDocsStorage } from './storage'

export async function getDocsStorage() {
  return createDocsStorage(env.DOCS_BUCKET, await caches.open('docs-objects'))
}

export async function getPackages() {
  return (await getDocsStorage()).libraries()
}

export async function getDocsContext(id: string, slug?: string) {
  return (await getDocsStorage()).context(
    id,
    slug,
    getRequestHeader('x-docs-snapshot') ?? undefined,
  )
}
