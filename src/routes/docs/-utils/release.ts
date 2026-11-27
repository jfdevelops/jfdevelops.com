const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/
const tagTtlSeconds = 300

type ReleaseCache = Pick<Cache, 'match' | 'put'>

type ReleaseOptions = {
  cache?: ReleaseCache
  /** Limits the result to one major, such as 3 for the v3 docs. */
  major?: number
}

function compareIdentifiers(left: string, right: string) {
  const leftNumber = /^\d+$/.test(left)
  const rightNumber = /^\d+$/.test(right)

  if (leftNumber && rightNumber) {
    return Number(left) - Number(right)
  }

  if (leftNumber !== rightNumber) {
    return leftNumber ? -1 : 1
  }

  return left < right ? -1 : left > right ? 1 : 0
}

export function compareVersions(left: string, right: string) {
  const a = semverPattern.exec(left)
  const b = semverPattern.exec(right)

  if (!a || !b) {
    return 0
  }

  for (const index of [1, 2, 3]) {
    const difference = Number(a[index]) - Number(b[index])

    if (difference !== 0) {
      return difference
    }
  }

  if (!a[4] || !b[4]) {
    return a[4] ? -1 : b[4] ? 1 : 0
  }

  const leftParts = a[4].split('.')
  const rightParts = b[4].split('.')

  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index++) {
    if (leftParts[index] === undefined || rightParts[index] === undefined) {
      return leftParts[index] === undefined ? -1 : 1
    }

    const difference = compareIdentifiers(leftParts[index], rightParts[index])

    if (difference !== 0) {
      return difference
    }
  }

  return 0
}

/**
 * Reads the library's versions from git tag names. Monorepo tags use
 * `<packageName>@<version>`; single-package repositories use `v<version>`.
 */
export function getTagVersions(tags: readonly string[], packageName: string) {
  const scoped = `${packageName}@`
  return tags.flatMap((tag) => {
    const version = tag.startsWith(scoped)
      ? tag.slice(scoped.length)
      : /^v\d/.test(tag)
        ? tag.slice(1)
        : null

    return version && semverPattern.test(version) ? [version] : []
  })
}

/**
 * The latest version, optionally within one major. Stable releases win over
 * prereleases; a prerelease is returned only when no stable release exists.
 */
export function getLatestTagVersion(tags: readonly string[], packageName: string, major?: number) {
  const versions = getTagVersions(tags, packageName)
    .filter((version) => major === undefined || Number(version.split('.')[0]) === major)
    .sort(compareVersions)
  const stable = versions.filter((version) => !version.includes('-'))

  return stable.at(-1) ?? versions.at(-1) ?? null
}

/** Parses tag names from git's smart HTTP ref advertisement. */
export function parseTagRefs(advertisement: string) {
  const tags = new Set<string>()

  for (const match of advertisement.matchAll(/ refs\/tags\/([^\s^]+)/g)) {
    tags.add(match[1])
  }

  return [...tags]
}

async function fetchTagRefs(repository: string, options: ReleaseOptions) {
  const url = `${repository.replace(/\/$/, '')}.git/info/refs?service=git-upload-pack`
  const cached = await options.cache?.match(url)

  if (cached) {
    return cached.text()
  }

  const response = await fetch(url, { headers: { 'user-agent': 'jfdevelops-docs' } })

  if (!response.ok) {
    throw new Error(`Could not read tags for ${repository} (${response.status})`)
  }

  const body = await response.text()

  await options.cache?.put(
    url,
    new Response(body, { headers: { 'cache-control': `public, max-age=${tagTtlSeconds}` } }),
  )

  return body
}

/** The latest released version of a library, from its repository's git tags. */
export async function getLatestReleaseVersion(
  repository: string,
  packageName: string,
  options: ReleaseOptions = {},
) {
  try {
    const tags = parseTagRefs(await fetchTagRefs(repository, options))

    return getLatestTagVersion(tags, packageName, options.major)
  } catch {
    return null
  }
}
