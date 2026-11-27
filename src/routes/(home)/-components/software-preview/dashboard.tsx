import { ArrowUpRight, Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { PreviewPanel } from './panel'

const bars = [34, 52, 43, 68, 58, 83, 95, 73, 88, 100, 86, 112]

function Metric({ label, children }: { label: string; children: ReactNode }) {
  return (
    <PreviewPanel>
      <span className="text-[8px] text-sea-ink-soft">{label}</span>
      <strong className="mt-1.5 flex items-center justify-between text-[24px] font-medium">
        {children}
      </strong>
    </PreviewPanel>
  )
}

function ActivityChart() {
  return (
    <PreviewPanel>
      <div className="flex items-center justify-between gap-2">
        <strong className="text-[9px] font-semibold">Work, moving forward</strong>
        <span className="text-[7px] text-sea-ink-soft">Weekly activity</span>
      </div>
      <div
        className="flex h-[94px] items-end gap-2 overflow-hidden bg-chart-grid pt-2"
        aria-hidden="true"
      >
        {bars.map((height) => (
          <i
            key={height}
            className="max-h-[84px] flex-1 rounded-t-[3px] bg-[#7d7d7d] nth-[3n]:bg-[#b5b5b5]"
            style={{ height }}
          />
        ))}
      </div>
      <div className="flex justify-between pt-[7px] text-[7px] text-sea-ink-soft">
        <span>MON</span>
        <span>WED</span>
        <span>FRI</span>
      </div>
    </PreviewPanel>
  )
}

export function DashboardPreview() {
  return (
    <>
      <div className="mb-3 grid grid-cols-2 gap-[9px]">
        <Metric label="Projects in motion">
          12 <ArrowUpRight size={17} />
        </Metric>
        <Metric label="Tasks completed">
          84 <span className="text-[7px] font-normal text-sea-ink-soft">This week</span>
        </Metric>
      </div>
      <ActivityChart />
      <div className="mt-3 flex items-center justify-between gap-2 text-[8px]">
        <span className="flex items-center gap-[5px]">
          <Check size={13} /> Customer onboarding
        </span>
        <span className="rounded-[4px] bg-brand-tint px-[7px] py-1 text-sea-ink-soft">
          Connected
        </span>
      </div>
    </>
  )
}
