import { execFileSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateSources(sources) {
  if (
    !sources ||
    typeof sources !== 'object' ||
    Array.isArray(sources) ||
    !Object.keys(sources).length
  ) {
    throw Error('Docs sources must contain at least one library')
  }

  for (const [id, library] of Object.entries(sources)) {
    if (!ID.test(id) || !library || typeof library.repository !== 'string' || !library.repository) {
      throw Error(`Invalid library source: ${id}`)
    }

    if (!library.channels || !Object.hasOwn(library.channels, library.defaultChannel)) {
      throw Error(`Missing default docs channel for ${id}`)
    }

    for (const [channelId, channel] of Object.entries(library.channels)) {
      if (!ID.test(channelId) || !channel || Boolean(channel.commit) === Boolean(channel.branch)) {
        throw Error(`Channel ${id}/${channelId} must specify exactly one commit or branch`)
      }

      if (channel.commit && !/^[a-f0-9]{40}$/.test(channel.commit)) {
        throw Error(`Invalid docs pin for ${id}/${channelId}: expected a 40-character commit`)
      }

      if (channel.branch) {
        execFileSync('git', ['check-ref-format', `refs/heads/${channel.branch}`])
      }
    }
  }
}

export async function checkoutDocs(directory, repository, channel) {
  await mkdir(directory, { recursive: true })
  const git = (...args) => execFileSync('git', args, { cwd: directory, encoding: 'utf8' }).trim()
  const ref = channel.commit ?? `refs/heads/${channel.branch}`

  git('init', '-q')
  git('remote', 'add', 'origin', repository)
  git('fetch', '--depth=1', 'origin', ref)
  git('checkout', '--detach', 'FETCH_HEAD')
  const commit = git('rev-parse', 'HEAD')

  if (channel.commit && commit !== channel.commit) {
    throw Error(`Docs checkout mismatch: expected ${channel.commit}, got ${commit}`)
  }

  return { commit, branch: channel.branch ?? null }
}

export function selectVersions(manifest, channelId, channel, isDefault) {
  if (isDefault) {
    return manifest.versions
  }

  const version = manifest.versions.find(
    (v) => v.id === (channel.version ?? manifest.defaultVersion),
  )

  if (!version) {
    throw Error(`Missing source version for docs channel ${channelId}`)
  }

  return [
    {
      ...version,
      id: channelId,
      label: channel.label ?? channelId,
      status: 'next',
      note: channel.note ?? null,
    },
  ]
}
