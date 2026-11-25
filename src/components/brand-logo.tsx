import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

function LogoImage({ className, ...props }: ComponentPropsWithRef<'img'>) {
  return <img alt="" width={620} height={144} className={cn('h-12 w-auto', className)} {...props} />
}

export function BrandLogo() {
  return (
    <span className="inline-flex items-center" role="img" aria-label="JF Develops">
      <LogoImage src="/brand/jf-develops-logo.png" className="block dark:hidden" />
      <LogoImage src="/brand/jf-develops-logo-dark.png" className="hidden dark:block" />
    </span>
  )
}
