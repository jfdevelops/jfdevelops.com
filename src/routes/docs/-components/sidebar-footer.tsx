import { GithubIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { getRouteApi } from '@tanstack/react-router'
import { NpmLogo } from '@/components/npm-logo'
import { Button } from '@/components/ui/button'

const docsRouteApi = getRouteApi('/docs/$package/$')

/** Repository and npm links for the current library, at the bottom of the docs sidebar. */
export function SidebarFooter() {
  const { repository, packageName } = docsRouteApi.useLoaderData({
    select: ({ pkg }) => {
      return {
        repository: pkg.repository,
        packageName: pkg.packageName,
      }
    },
  })

  return (
    <div className="flex items-center gap-1 border-t px-3 py-2">
      <Button
        variant="ghost"
        size="icon-lg"
        nativeButton={false}
        render={
          <a
            href={repository}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub repository"
          />
        }
      >
        <HugeiconsIcon icon={GithubIcon} strokeWidth={1.5} />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        nativeButton={false}
        render={
          <a
            href={`https://www.npmjs.com/package/${packageName}`}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="npm package"
          />
        }
      >
        <NpmLogo />
      </Button>
    </div>
  )
}
