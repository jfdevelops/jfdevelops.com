import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { DocsLibrary } from '@/routes/docs/-utils/libraries'

type LibraryCardProps = {
  library: DocsLibrary
  version: string | null | undefined
  index: number
}

export function LibraryCard({ library, version, index }: LibraryCardProps) {
  const Icon = library.icon

  return (
    <Link
      to="/docs/$package"
      params={{ package: library.id }}
      className="group relative isolate flex min-h-[15.5rem] animate-rise-in flex-col overflow-hidden rounded-[1.15rem] border border-line bg-foam bg-linear-180 from-sand/12 to-transparent p-[1.35rem] pb-[1.2rem] text-start text-inherit no-underline transition-[transform,border-color,background-color] duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-lagoon/55 hover:from-lagoon/7 hover:to-72% focus-visible:border-lagoon/55 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-lagoon motion-safe:hover:-translate-y-1.5 motion-safe:focus-visible:-translate-y-1.5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px] transition-colors duration-220 group-hover:bg-lagoon-deep group-focus-visible:bg-lagoon-deep"
        aria-hidden="true"
      />
      <span className="mb-[1.35rem] flex items-start justify-between gap-4">
        <span className="inline-flex size-[2.55rem] items-center justify-center rounded-[0.85rem] border border-lagoon/33 bg-lagoon/10 text-lagoon-deep transition duration-220 group-hover:border-lagoon/45 group-hover:bg-lagoon/16 group-focus-visible:border-lagoon/45 group-focus-visible:bg-lagoon/16 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-focus-visible:-translate-y-0.5 [&_svg]:size-[1.15rem]">
          <Icon aria-hidden="true" />
        </span>
        {version ? (
          <span className="font-mono text-[0.72rem] font-semibold tracking-[0.02em] text-sea-ink-soft">
            {version}
          </span>
        ) : null}
      </span>
      <span className="flex flex-1 flex-col gap-[0.7rem]">
        <span className="flex items-start justify-between gap-3 font-display text-[1.35rem] leading-[1.15] font-bold tracking-[-0.03em] text-sea-ink">
          {library.title}
          <ArrowUpRight
            aria-hidden="true"
            className="mt-[0.2rem] size-4 shrink-0 text-sea-ink-soft transition duration-220 group-hover:text-lagoon-deep group-focus-visible:text-lagoon-deep motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
          />
        </span>
        <span className="text-[0.9rem] leading-[1.65] text-sea-ink-soft">
          {library.description}
        </span>
      </span>
      <span className="mt-[1.35rem] text-[0.78rem] font-bold tracking-[0.08em] text-lagoon-deep uppercase opacity-72 transition duration-180 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:group-hover:translate-x-0.5">
        Open docs
      </span>
    </Link>
  )
}
