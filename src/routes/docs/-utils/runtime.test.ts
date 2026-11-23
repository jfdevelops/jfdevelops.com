import { describe, expect, it, vi } from 'vitest'
import { serveDocsRequest } from './edge'
import { createRuntimeDocs, type SnapshotCache } from './runtime'

function fixture() {
  let clock = 0
  let revision = 'a'.repeat(64)
  const origin = 'https://raw.githubusercontent.com/example/site/docs-content'
  const records = new Map<string, Response>()
  const pending: Promise<unknown>[] = []
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
  const fetcher = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.endsWith('/current.json'))

      return Response.json({ schemaVersion: 1, revision, sourceCommit: revision[0].repeat(40) })
    const selected = url.split('/snapshots/')[1]?.split('/')[0] ?? revision
    if (url.endsWith('/manifest.json'))

      return Response.json({ schemaVersion: 1, sourceBranch: 'main', library: library(selected) })

    return Response.json({
      schemaVersion: 1,
      framework: 'react',
      version: 'v1',
      id: 'overview',
      title: 'Overview',
      description: 'Read docs.',
      toc: [],
      body: [{ tag: 'p', props: {}, children: [selected] }],
    })
  })
  const log = vi.fn()
  const service = createRuntimeDocs({
    repositories,
    origin,
    cache,
    fetch: fetcher,
    waitUntil(promise) {
      pending.push(promise)
    },
    now: () => clock,
    log,
  })

  return {
    service,
    cache,
    fetcher,
    pending,
    log,
    library,
    setClock(value: number) {
      clock = value
    },
    update() {
      revision = 'b'.repeat(64)
    },
  }
}

describe('on-demand GitHub docs', () => {
  it('fetches metadata and only the requested page, then uses immutable cached data', async () => {
    const f = fixture()
    const first = await f.service.page('sample', 'react', 'v1', 'overview')
    expect(first?.page.title).toBe('Overview')
    expect(f.fetcher).toHaveBeenCalledTimes(3)
    expect(await f.service.page('sample', 'react', 'v1', 'overview')).toEqual(first)
    expect(f.fetcher).toHaveBeenCalledTimes(3)
    expect(await f.service.page('unregistered', 'react', 'v1', 'overview')).toBeNull()
    expect(await f.service.page('sample', 'react', 'v1', '../../secret')).toBeNull()
    expect(f.fetcher).toHaveBeenCalledTimes(3)
  })

  it('serves stale content while validating a new main snapshot in the background', async () => {
    const f = fixture()
    const first = await f.service.page('sample', 'react', 'v1', 'overview')
    f.update()
    f.setClock(61000)
    const stale = await f.service.page('sample', 'react', 'v1', 'overview')
    expect(stale?.revision).toBe(first?.revision)
    expect(f.pending).toHaveLength(1)
    await Promise.all(f.pending)
    const current = await f.service.page('sample', 'react', 'v1', 'overview')
    expect(current?.revision).toBe('b'.repeat(64))
    expect(current?.pkg.commit).toBe('b'.repeat(40))
  })

  it('keeps the last good snapshot when the refresh origin fails', async () => {
    const f = fixture()
    const first = await f.service.page('sample', 'react', 'v1', 'overview')
    f.setClock(61000)
    f.fetcher.mockRejectedValue(new Error('GitHub unavailable'))
    expect(await f.service.page('sample', 'react', 'v1', 'overview')).toEqual(first)
    await Promise.all(f.pending)
    expect(f.log).toHaveBeenCalled()
  })

  it('rejects invalid metadata before advancing the cached pointer', async () => {
    const f = fixture()
    const first = await f.service.library('sample')
    f.update()
    f.setClock(61000)
    const fetcher = f.fetcher.getMockImplementation()
    if (!fetcher) throw new Error('Missing fetch fixture')
    f.fetcher.mockImplementation(async (url, ...args) =>
      String(url).endsWith('manifest.json')
        ? Response.json({ schemaVersion: 999 })
        : fetcher(url, ...args),
    )
    expect((await f.service.library('sample'))?.revision).toBe(first?.revision)
    await Promise.all(f.pending)
    expect(f.log).toHaveBeenCalled()
    expect((await f.service.library('sample'))?.revision).toBe(first?.revision)
  })

  it('uses previous page data after a transient failure in a promoted snapshot', async () => {
    const f = fixture()
    const first = await f.service.page('sample', 'react', 'v1', 'overview')
    f.update()
    f.setClock(61000)
    await f.service.library('sample')
    await Promise.all(f.pending)
    const fetcher = f.fetcher.getMockImplementation()
    if (!fetcher) throw new Error('Missing fetch fixture')
    f.fetcher.mockImplementation(async (url, ...args) =>
      String(url).includes(`/${'b'.repeat(64)}/pages/`)
        ? new Response('Unavailable', { status: 503 })
        : fetcher(url, ...args),
    )
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

