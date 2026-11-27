import { Link } from '@tanstack/react-router'
import { BrandLogo } from '@/components/brand-logo'
import { cn } from '@/lib/utils'

/** Brand logo linking home, shown at the top of the docs sidebar. */
export function NavTitle({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('no-underline', className)}>
      <BrandLogo className="h-9" />
    </Link>
  )
}
