import { afterEach, expect, it, vi } from 'vitest'
import {
  compareVersions,
  getLatestReleaseVersion,
  getLatestTagVersion,
  parseTagRefs,
} from './release'

afterEach(() => {
  vi.unstubAllGlobals()
})

const advertisement = [
  '001e# service=git-upload-pack',
  '0000015b1111111111111111111111111111111111111111 HEAD\0multi_ack',
  '003f2222222222222222222222222222222222222222 refs/heads/main',
  '00403333333333333333333333333333333333333333 refs/tags/v0.10.0',
  '00434444444444444444444444444444444444444444 refs/tags/v0.10.0^{}',
  '00405555555555555555555555555555555555555555 refs/tags/v0.11.0',
  '003f6666666666666666666666666666666666666666 refs/tags/v0.9.0',
  '0000',
].join('\n')

it('parses tag names from a git ref advertisement', () => {
  expect(parseTagRefs(advertisement)).toEqual(['v0.10.0', 'v0.11.0', 'v0.9.0'])
})

it('orders versions by semver, with releases above their prereleases', () => {
  expect(compareVersions('0.11.0', '0.9.0')).toBeGreaterThan(0)
  expect(compareVersions('1.0.0', '1.0.0-beta.17')).toBeGreaterThan(0)
  expect(compareVersions('1.0.0-beta.17', '1.0.0-beta.9')).toBeGreaterThan(0)
})

it('picks the latest v-prefixed tag for single-package repositories', () => {
  expect(getLatestTagVersion(['v0.9.0', 'v0.11.0', 'v0.10.0'], '@jfdevelops/cli')).toBe('0.11.0')
})

it('only reads monorepo tags for the matching package', () => {
  const tags = [
    '@jfdevelops/react-layout@4.3.0',
    '@jfdevelops/react-layout@4.10.0',
    '@jfdevelops/react-layout-extra@9.0.0',
  ]

  expect(getLatestTagVersion(tags, '@jfdevelops/react-layout')).toBe('4.10.0')
  expect(getLatestTagVersion(tags, '@jfdevelops/missing')).toBeNull()
})

it('limits the latest version to the selected major and prefers stable releases', () => {
  const tags = ['v3.2.0', 'v3.3.0', 'v4.3.0', 'v5.0.0-beta.1']

  expect(getLatestTagVersion(tags, '@jfdevelops/react-layout', 3)).toBe('3.3.0')
  expect(getLatestTagVersion(tags, '@jfdevelops/react-layout')).toBe('4.3.0')
  expect(getLatestTagVersion(tags, '@jfdevelops/react-layout', 5)).toBe('5.0.0-beta.1')
  expect(getLatestTagVersion(tags, '@jfdevelops/react-layout', 2)).toBeNull()
})

it('reads the latest tag from the repository and returns null on failure', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(advertisement))

  vi.stubGlobal('fetch', fetchMock)

  await expect(
    getLatestReleaseVersion('https://github.com/jfdevelops/cli', '@jfdevelops/cli'),
  ).resolves.toBe('0.11.0')
  expect(fetchMock.mock.calls[0][0]).toBe(
    'https://github.com/jfdevelops/cli.git/info/refs?service=git-upload-pack',
  )

  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })))

  await expect(
    getLatestReleaseVersion('https://github.com/jfdevelops/cli', '@jfdevelops/cli'),
  ).resolves.toBeNull()
})
