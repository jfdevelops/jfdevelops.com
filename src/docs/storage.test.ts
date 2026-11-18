import { describe, expect, it } from 'vitest'
import { type ArtifactObject, buildArtifact, publishArtifact } from '../../scripts/docs/artifact'
import { createDocsStorage } from './storage'
import { fixtureLibrary } from './testing/fixture'

class MemoryBucket {
  objects = new Map<string, ArtifactObject>()
  reads = 0
  async get(key: string) {
    this.reads++
    const value = this.objects.get(key)

    return value
      ? {
          body: new Response(
            typeof value.body === 'string' ? value.body : Uint8Array.from(value.body),
          ).body,
          httpEtag: 'etag',
          httpMetadata: { contentType: value.contentType },
        }
      : null
  }
  async list({ prefix }: { prefix: string }) {
    return {
      objects: [...this.objects.keys()]
        .filter((key) => key.startsWith(prefix))
        .map((key) => ({ key })),
      truncated: false,
    }
  }
  async put(object: ArtifactObject) {
    this.objects.set(object.key, object)
  }
}
class MemoryCache {
  objects = new Map<string, { response: Response; expires: number }>()
  now = 0
  async match(request: Request) {
    const value = this.objects.get(request.url)

    return value && value.expires > this.now ? value.response.clone() : undefined
  }
  async put(request: Request, response: Response) {
    const ttl = Number(/max-age=(\d+)/.exec(response.headers.get('cache-control') ?? '')?.[1] ?? 0)
    this.objects.set(request.url, { response, expires: this.now + ttl })
  }
}

describe('independent R2 publication', () => {
  it('publishes complete snapshots, caches pages and discovers new content without a site build', async () => {
    const bucket = new MemoryBucket()
    const cache = new MemoryCache()
    const storage = createDocsStorage(bucket, cache)
    const first = buildArtifact(fixtureLibrary())
    await publishArtifact(first, (object) => bucket.put(object))
    expect((await storage.libraries())[0].name).toBe('React Layout')
    expect((await storage.context('react-layout', 'v4'))?.page?.title).toBe('Overview')
    const reads = bucket.reads
    await storage.context('react-layout', 'v4')
    expect(bucket.reads).toBe(reads)
    const changed = fixtureLibrary()
    changed.pages[0].title = 'Updated independently'
    changed.pages.push({
      ...changed.pages[0],
      slug: 'v4/new-guide',
      pageId: 'new-guide',
      title: 'New guide',
    })
    changed.versions[0].navigation[0].pages.push('new-guide')
    changed.pageExists.v4.push('new-guide')
    const second = buildArtifact(changed)
    await publishArtifact(second, (object) => bucket.put(object))
    expect((await storage.context('react-layout', 'v4'))?.page?.title).toBe('Overview')
    cache.now = 16
    expect((await storage.context('react-layout', 'v4'))?.page?.title).toBe('Updated independently')
    expect((await storage.context('react-layout', 'v4', first.snapshot))?.page?.title).toBe(
      'Overview',
    )
    expect((await storage.context('react-layout', 'v4/new-guide'))?.page?.title).toBe('New guide')
    const additional = fixtureLibrary()
    additional.id = 'another-library'
    additional.name = 'Another Library'
    await publishArtifact(buildArtifact(additional), (object) => bucket.put(object))
    expect((await storage.libraries()).map((library) => library.id)).toContain('another-library')
    expect((await storage.context('react-layout', 'missing'))?.page).toBeNull()
    expect(await storage.context('unknown')).toBeNull()
  })

  it('does not move the published pointer after an upload or warming failure', async () => {
    const bucket = new MemoryBucket()
    const first = buildArtifact(fixtureLibrary())
    await publishArtifact(first, (object) => bucket.put(object))
    const changed = fixtureLibrary()
    changed.pages[0].title = 'Next'
    const second = buildArtifact(changed)
    await expect(
      publishArtifact(second, async (object) => {
        if (object.key.endsWith('pages/v4.json')) {
          throw new Error('upload failed')
        }
        await bucket.put(object)
      }),
    ).rejects.toThrow('upload failed')
    expect(
      JSON.parse(String(bucket.objects.get('libraries/react-layout.json')?.body)).snapshot,
    ).toBe(first.snapshot)
    await expect(
      publishArtifact(
        second,
        (object) => bucket.put(object),
        async () => {
          throw new Error('warm failed')
        },
      ),
    ).rejects.toThrow('warm failed')
    expect(
      JSON.parse(String(bucket.objects.get('libraries/react-layout.json')?.body)).snapshot,
    ).toBe(first.snapshot)
  })

  it('addresses assets by snapshot and rejects bad manifests and traversal', () => {
    const library = fixtureLibrary()
    library.pages[0].html = '<img src="/docs-assets/react-layout/v4/assets/x.svg">'
    const artifact = buildArtifact(library, [
      {
        path: 'v4/assets/x.svg',
        body: new TextEncoder().encode('<svg/>'),
        contentType: 'image/svg+xml',
      },
    ])
    expect(
      artifact.objects.some((object) =>
        String(object.body).includes(
          `/_docs/assets/react-layout/${artifact.snapshot}/v4/assets/x.svg`,
        ),
      ),
    ).toBe(true)
    expect(() =>
      buildArtifact(library, [
        { path: '../private', body: new Uint8Array(), contentType: 'text/plain' },
      ]),
    ).toThrow('Invalid docs asset')
    expect(() => buildArtifact({ ...library, pages: [] })).toThrow()
  })
})

import { serveDocsRequest } from './edge'

describe('edge-rendered docs', () => {
  it('serves complete cached HTML, switches snapshots and never tells browsers to cache stale docs', async () => {
    const bucket = new MemoryBucket()
    const objects = new MemoryCache()
    const html = new MemoryCache()
    const storage = createDocsStorage(bucket, objects)
    let renders = 0
    const tasks: Promise<unknown>[] = []
    const services = {
      storage,
      cache: html,
      viewer: 'viewer-1',
      waitUntil: (task: Promise<unknown>) => {
        tasks.push(task)
      },
      render: async (request: Request) => {
        renders++
        const context = await storage.context(
          'react-layout',
          'v4',
          request.headers.get('x-docs-snapshot') ?? undefined,
        )

        return new Response(`<article>${context?.page?.title}</article>`, {
          headers: { 'content-type': 'text/html' },
        })
      },
    }
    const request = new Request('https://jfdevelops.com/docs/react-layout/v4')
    await publishArtifact(buildArtifact(fixtureLibrary()), (object) => bucket.put(object))
    const first = await serveDocsRequest(request, services)
    expect(await first.text()).toBe('<article>Overview</article>')
    await Promise.all(tasks)
    const cached = await serveDocsRequest(request, services)
    expect(cached.headers.get('x-docs-cache')).toBe('HIT')
    expect(cached.headers.get('cache-control')).toBe('no-cache')
    expect(renders).toBe(1)
    const changed = fixtureLibrary()
    changed.pages[0].title = 'New docs'
    const next = buildArtifact(changed)
    await publishArtifact(next, (object) => bucket.put(object))
    objects.now = 16
    const updated = await serveDocsRequest(request, services)
    expect(await updated.text()).toBe('<article>New docs</article>')
    expect(updated.headers.get('x-docs-snapshot')).toBe(next.snapshot)
    await serveDocsRequest(new Request(request, { headers: { cookie: 'private=true' } }), services)
    expect(renders).toBe(3)
    await serveDocsRequest(request, { ...services, viewer: 'viewer-2' })
    expect(renders).toBe(4)
  })

  it('warms an unpublished snapshot before flipping its pointer, and serves immutable assets', async () => {
    const bucket = new MemoryBucket()
    const cache = new MemoryCache()
    const storage = createDocsStorage(bucket, cache)
    const artifact = buildArtifact(fixtureLibrary(), [
      {
        path: 'v4/assets/test.svg',
        body: new TextEncoder().encode('<svg/>'),
        contentType: 'image/svg+xml',
      },
    ])
    const services = {
      storage,
      cache,
      viewer: 'viewer',
      waitUntil: (_task: Promise<unknown>) => {},
      render: async () =>
        new Response('<article>Staged docs</article>', {
          headers: { 'content-type': 'text/html' },
        }),
    }
    await publishArtifact(
      artifact,
      (object) => bucket.put(object),
      async () => {
        expect(bucket.objects.has('libraries/react-layout.json')).toBe(false)
        const result = await serveDocsRequest(
          new Request('https://jfdevelops.com/docs/react-layout/v4', {
            headers: { 'x-docs-snapshot': artifact.snapshot },
          }),
          services,
        )
        expect(result.headers.get('x-docs-snapshot')).toBe(artifact.snapshot)
        expect(await result.text()).toContain('Staged docs')
      },
    )
    const image = await serveDocsRequest(
      new Request(
        `https://jfdevelops.com/_docs/assets/react-layout/${artifact.snapshot}/v4/assets/test.svg`,
      ),
      services,
    )
    expect(image.headers.get('content-type')).toBe('image/svg+xml')
    expect(await image.text()).toBe('<svg/>')
  })
})
