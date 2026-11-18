import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkoutDocs, selectVersions, validateSources } from './sources.mjs'

const manifest = {
  defaultVersion: 'v4',
  versions: [
    { id: 'v4', path: 'v4', label: 'v4', status: 'current' },
    { id: 'v5', path: 'v5', label: 'v5 Alpha', status: 'next' },
  ],
}

describe('library-owned docs channels', () => {
  it('discovers every manifest version, including new unreleased folders', () => {
    expect(selectVersions(manifest, 'stable', {}, true)).toEqual(manifest.versions)
  })

  it('supports optional branch channels without changing the source manifest', () => {
    const versions = selectVersions(manifest, 'alpha', { version: 'v5', label: 'Alpha' }, false)
    expect(versions[0]).toMatchObject({ id: 'alpha', label: 'Alpha', path: 'v5', status: 'next' })
    expect(manifest.versions[1].id).toBe('v5')
    expect(() => selectVersions(manifest, 'alpha', { version: 'v99' }, false)).toThrow(
      'Missing source version',
    )
  })

  it('requires an unambiguous source and an existing default channel', () => {
    const config = (channel) => ({
      library: { repository: 'repo', defaultChannel: 'stable', channels: { stable: channel } },
    })
    expect(() => validateSources(config({ branch: 'main' }))).not.toThrow()
    expect(() => validateSources(config({ branch: 'main', commit: 'a'.repeat(40) }))).toThrow(
      'exactly one',
    )
    expect(() => validateSources(config({ branch: '../bad' }))).toThrow()
    expect(() => validateSources({ library: { repository: 'repo', channels: {} } })).toThrow(
      'Missing default',
    )
  })

  it('resolves a branch into an exact snapshot and rejects missing refs', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'docs-channel-test-'))
    const repo = path.join(root, 'repo')
    await mkdir(repo)
    const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim()

    try {
      git('init', '-q', '-b', 'docs')
      git('config', 'user.name', 'Fixture')
      git('config', 'user.email', 'fixture@example.com')
      await writeFile(path.join(repo, 'page.md'), 'First snapshot')
      git('add', '.')
      git('commit', '-qm', 'first')
      const first = await checkoutDocs(path.join(root, 'first'), repo, { branch: 'docs' })
      await writeFile(path.join(repo, 'page.md'), 'Next snapshot')
      git('commit', '-qam', 'second')
      const second = await checkoutDocs(path.join(root, 'second'), repo, { branch: 'docs' })
      expect(first.commit).not.toBe(second.commit)
      expect(second.commit).toBe(git('rev-parse', 'HEAD'))
      const pinned = await checkoutDocs(path.join(root, 'pinned'), repo, { commit: first.commit })
      expect(pinned.commit).toBe(first.commit)
      await expect(
        checkoutDocs(path.join(root, 'missing'), repo, { branch: 'missing' }),
      ).rejects.toThrow()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  }, 30000)
})
