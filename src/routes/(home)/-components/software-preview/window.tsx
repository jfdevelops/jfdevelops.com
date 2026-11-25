import { Layers, LayoutDashboard, Settings, Users } from 'lucide-react'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { PreviewAvatar } from './avatar'

type PreviewWindowProps = ComponentPropsWithRef<'div'> & {
  path: string
  heading: string
  children: ReactNode
}

function WindowBar({ path }: { path: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-line bg-brand-tint p-3 font-[monospace] text-[9px] text-sea-ink-soft">
      <span className="text-[8px] tracking-[2px] text-sea-ink-soft" aria-hidden="true">
        ● ● ●
      </span>
      <span>workspace / {path}</span>
      <span aria-hidden="true">↗</span>
    </div>
  )
}

function WindowSidebar() {
  return (
    <div
      className="flex w-[43px] shrink-0 flex-col items-center gap-6 border-r border-line py-3.5 text-sea-ink-soft"
      aria-hidden="true"
    >
      <img
        className="block size-6 rounded-[6px]"
        src="/brand/icon-192.png"
        alt=""
        width={24}
        height={24}
      />
      <LayoutDashboard size={16} />
      <Layers size={16} />
      <Users size={16} />
      <Settings size={16} />
    </div>
  )
}

function WindowHeading({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-2">
      <div>
        <small className="mb-1.5 block text-[7px] tracking-[0.08em] text-sea-ink-soft">
          YOUR BUSINESS, CONNECTED
        </small>
        <strong className="font-display text-[19px] font-medium">{children}</strong>
      </div>
      <PreviewAvatar />
    </div>
  )
}

/** App-window frame for the illustrative software screens. */
export function PreviewWindow({
  path,
  heading,
  children,
  className,
  ...props
}: PreviewWindowProps) {
  return (
    <div
      role="img"
      className={cn(
        'overflow-hidden rounded-[8px] border border-line bg-surface-strong text-sea-ink',
        className,
      )}
      {...props}
    >
      <WindowBar path={path} />
      <div className="flex min-h-[295px]">
        <WindowSidebar />
        <div className="min-w-0 flex-1 px-4 pt-5 pb-3">
          <WindowHeading>{heading}</WindowHeading>
          {children}
          <span className="mt-[13px] block text-[7px] text-sea-ink-soft">
            Illustrative interface · Sample data
          </span>
        </div>
      </div>
    </div>
  )
}
