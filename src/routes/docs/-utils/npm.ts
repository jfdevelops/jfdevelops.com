import { z } from 'zod'

const npmLatestSchema = z.object({
  version: z.string().min(1),
})

export async function getLatestNpmVersion(packageName: string) {
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`,
    {
      headers: { accept: 'application/json' },
    },
  )

  if (!response.ok) {
    return null
  }

  const parsed = npmLatestSchema.safeParse(await response.json())

  return parsed.success ? parsed.data.version : null
}

export async function getLatestNpmVersions(packageNames: readonly string[]) {
  const entries = await Promise.all(
    packageNames.map(async (packageName) => {
      const version = await getLatestNpmVersion(packageName)

      return [packageName, version] as const
    }),
  )

  return Object.fromEntries(entries) as Record<string, string | null>
}
