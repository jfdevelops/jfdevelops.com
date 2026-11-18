import type { ComponentProps } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { versionDestination } from '@/docs/registry'
import { cn } from '@/lib/utils'
import { useDocs } from './context'

export function DocsNotices({ className, children, ...props }: ComponentProps<'div'>) {
  const { pkg, page, version } = useDocs()

  return (
    <div className={cn('mb-6 space-y-3 empty:hidden', className)} {...props}>
      {version.status === 'previous' && (
        <Alert>
          <AlertTitle>You are reading docs for an older major.</AlertTitle>
          <AlertDescription>
            <a href={versionDestination(pkg, page, pkg.defaultVersion)}>Read the current docs</a>.
          </AlertDescription>
        </Alert>
      )}
      {version.status === 'legacy' && (
        <Alert variant="destructive">
          <AlertTitle>Legacy documentation</AlertTitle>
          <AlertDescription>{version.note}</AlertDescription>
        </Alert>
      )}
      {version.status === 'next' && (
        <Alert>
          <AlertTitle>This version is not released.</AlertTitle>
          <AlertDescription>
            {version.note ?? 'These docs track work in progress and may change before release.'}
          </AlertDescription>
        </Alert>
      )}
      {version.examples.verification === 'adapted-from-source' && (
        <Alert>
          <AlertDescription>Examples were adapted from source and not compiled.</AlertDescription>
        </Alert>
      )}
      {children}
    </div>
  )
}
