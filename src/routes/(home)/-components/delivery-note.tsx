import { Check } from 'lucide-react'

export function DeliveryNote() {
  return (
    <div className="relative mt-4 flex w-fit max-w-full items-center gap-3 rounded-[8px] border border-line bg-surface-strong px-5 py-[15px] text-sea-ink shadow-[0_10px_20px_#00000010] max-[900px]:p-3">
      <span className="block shrink-0 rounded-full bg-brand-tint p-[9px]">
        <Check size={19} aria-hidden="true" />
      </span>
      <div>
        <strong className="block text-[12px]">Built around your workflow.</strong>
        <span className="mt-1 block text-[10px] text-sea-ink-soft">
          Connected. Considered. Yours.
        </span>
      </div>
    </div>
  )
}
