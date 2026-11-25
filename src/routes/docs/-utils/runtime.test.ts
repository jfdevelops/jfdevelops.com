import { describe, expect, it, vi } from 'vitest'
import { serveDocsRequest } from './edge'
import { createRuntimeDocs, type SnapshotCache } from './runtime'

function fixture() {
  let revision = 'a'.repeat(64)
  const records = new Map<string, Response>()
  const cache: SnapshotCache = {
    async match(request) {
      return records.get(request.url)?.clone()
    },
    async put(request, response) {
      records.set(request.url, response.clone())
    },
  }
  const repositories = [
    {
      id: 'sample',
      repository: 'https://github.com/example/library',
      branch: 'main',
      description: 'Sample docs.',
    },
  ]
  function library(revision: string) {
    return {
      slug: 'sample',
      name: 'Sample',
      packageName: '@example/library',
      description: 'Sample docs.',
      repository: repositories[0].repository,
      commit: revision[0].repeat(40),
      pageCount: 1,
      frameworks: [
        {
          id: 'react',
          title: 'React',
          defaultVersion: 'v1',
          versions: [
            {
              id: 'v1',
              label: 'v1',
              status: 'current',
              path: 'framework/react/v1',
              endpointVersion: '1.0.0',
              defaultPage: 'overview',
              pages: [{ id: 'overview', file: 'overview.md', title: 'Overview', headings: [] }],
              tree: {
                name: 'Sample',
                children: [{ type: 'page', name: 'Overview', url: '/docs/sample/react/v1' }],
              },
            },
          ],
        },
      ],
    }
  }
  const read = vi.fn(async (path: string): Promise<unknown> => {
    if (path.endsWith('/current.json'))
      return { schemaVersion: 1, revision, sourceCommit: revision[0].repeat(40) }
    const selected = path.split('/snapshots/')[1]?.split('/')[0] ?? revision
    if (path.endsWith('/manifest.json'))
      return { schemaVersion: 1, sourceBranch: 'main', library: library(selected) }

    return {
      schemaVersion: 1,
      framework: 'react',
      version: 'v1',
      id: 'overview',
      title: 'Overview',
      description: 'Read docs.',
      toc: [],
      body: [{ tag: 'p', props: {}, children: [selected] }],
    }
  })
  const log = vi.fn()
  const service = createRuntimeDocs({ repositories, read, cache, log })

  return {
    service,
    cache,
    read,
    log,
    library,
    update() {
      revision = 'b'.repeat(64)
    },
  }
}

function pointerReads(read: ReturnType<typeof fixture>['read']) {
  return read.mock.calls.filter(([path]) => path.endsWith('/current.json')).length
}

describe('runtime docs snapshots', () => {
  it('reads the pointer per request but immutable metadata and pages only once', async () => {
    const f = fixture()
    const first = await f.service.page('sample', 'react', 'v1', 'overview')
    expect(first?.page.title).toBe('Overview')
    expect(f.read).toHaveBeenCalledTimes(3)
    expect(await f.service.page('sample', 'react', 'v1', 'overview')).toEqual(first)
    expect(f.read).toHaveBeenCalledTimes(4)
    expect(pointerReads(f.read)).toBe(2)
    expect(await f.service.page('unregistered', 'react', 'v1', 'overview')).toBeNull()
    expect(await f.service.page('sample', 'react', 'v1', '../../secret')).toBeNull()
    expect(f.read).toHaveBeenCalledTimes(5)
  })

  it('rewrites package-derived snapshot slugs to the registered catalog id', async () => {
    const f = fixture()
    const read = f.read.getMockImplementation()

    if (!read) {
      throw new Error('Missing read fixture')
    }

    f.read.mockImplementation(async (path) => {
      const value = await read(path)

      if (!path.endsWith('/manifest.json')) {
        return value
      }

      const manifest = value as { library: ReturnType<typeof f.library> }

      manifest.library.slug = 'sample-core'
      manifest.library.frameworks[0].versions[0].tree.children[0].url = '/docs/sample-core/react/v1'

      return manifest
    })

    const library = await f.service.library('sample')

    expect(library?.library.slug).toBe('sample')
    expect(library?.library.frameworks[0]?.versions[0]?.tree.children[0]).toMatchObject({
      url: '/docs/sample/react/v1',
    })
  })

  it('serves a newly published snapshot on the very next request', async () => {
    const f = fixture()
    const first = await f.service.page('sample', 'react', 'v1', 'overview')
    f.update()
    const current = await f.service.page('sample', 'react', 'v1', 'overview')
    expect(first?.revision).toBe('a'.repeat(64))
    expect(current?.revision).toBe('b'.repeat(64))
    expect(current?.pkg.commit).toBe('b'.repeat(40))
  })

  it('keeps the last good snapshot when the store cannot be read', async () => {
    const f = fixture()
    const first = await f.service.page('sample', 'react', 'v1', 'overview')
    f.read.mockRejectedValue(new Error('R2 unavailable'))
    expect(await f.service.page('sample', 'react', 'v1', 'overview')).toEqual(first)
    expect(f.log).toHaveBeenCalled()
  })

  it('rejects invalid metadata before advancing the cached pointer', async () => {
    const f = fixture()
    const first = await f.service.library('sample')
    f.update()
    const read = f.read.getMockImplementation()
    if (!read) throw new Error('Missing read fixture')
    f.read.mockImplementation(async (path) =>
      path.endsWith('manifest.json') ? { schemaVersion: 999 } : read(path),
    )
    expect((await f.service.library('sample'))?.revision).toBe(first?.revision)
    expect(f.log).toHaveBeenCalled()
  })

  it('uses previous page data after a transient failure in a promoted snapshot', async () => {
    const f = fixture()
    const first = await f.service.page('sample', 'react', 'v1', 'overview')
    f.update()
    await f.service.library('sample')
    const read = f.read.getMockImplementation()
    if (!read) throw new Error('Missing read fixture')
    f.read.mockImplementation(async (path) => {
      if (path.includes(`/${'b'.repeat(64)}/pages/`)) {
        throw new Error('Unavailable')
      }

      return read(path)
    })
    expect(await f.service.page('sample', 'react', 'v1', 'overview')).toEqual(first)
  })
})

it('caches public rendered HTML by snapshot and UI deployment, and bypasses private requests', async () => {
  const f = fixture()
  const render = vi.fn(
    async () =>
      new Response('<main>Docs</main>', { headers: { 'x-docs-revision': 'a'.repeat(64) } }),
  )
  const options = { docs: f.service, cache: f.cache, viewer: 'ui-1', render }
  const request = new Request('https://example.com/docs/sample/react/v1')
  await serveDocsRequest(request, options)
  const hit = await serveDocsRequest(request, options)
  expect(await hit.text()).toContain('Docs')
  expect(hit.headers.get('cache-control')).toContain('must-revalidate')
  expect(render).toHaveBeenCalledTimes(1)
  await serveDocsRequest(request, { ...options, viewer: 'ui-2' })
  expect(render).toHaveBeenCalledTimes(2)
  await serveDocsRequest(new Request(request, { headers: { cookie: 'session=private' } }), options)
  expect(render).toHaveBeenCalledTimes(3)
})
