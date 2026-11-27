import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

function LogoImage({ className, ...props }: ComponentPropsWithRef<'img'>) {
  return <img alt="" width={620} height={144} className={cn('h-12 w-auto', className)} {...props} />
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className="inline-flex items-center" role="img" aria-label="JF Develops">
      <LogoImage src="/brand/jf-develops-logo.png" className={cn('block dark:hidden', className)} />
      <LogoImage
        src="/brand/jf-develops-logo-dark.png"
        className={cn('hidden dark:block', className)}
      />
    </span>
  )
}
