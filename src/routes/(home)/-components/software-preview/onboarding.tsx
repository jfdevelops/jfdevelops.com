import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <small className="text-[8px]">{label}</small>
      <div className="rounded-[4px] border border-line p-2.5 text-[10px] text-sea-ink-soft">
        {children}
      </div>
    </>
  )
}

export function OnboardingPreview() {
  return (
    <>
      <div className="flex gap-[9px] border-b border-line pb-[15px] text-[8px] text-sea-ink-soft">
        <span className="font-bold text-sea-ink">01 About you</span>
        <span>02 Your project</span>
        <span>03 Review</span>
      </div>
      <div className="my-[18px] flex flex-col gap-[9px]">
        <span className="mb-[7px] font-display text-[14px]">Let’s get acquainted.</span>
        <Field label="Company name">Acme Studio</Field>
        <Field label="What are you building?">A better customer experience</Field>
        <p className="mt-[5px] flex items-center justify-between rounded-[4px] bg-sea-ink p-2.5 text-[10px] text-foam">
          Continue <ArrowUpRight size={15} />
        </p>
      </div>
    </>
  )
}
