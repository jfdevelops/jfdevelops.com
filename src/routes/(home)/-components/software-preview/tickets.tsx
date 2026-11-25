import { Circle } from 'lucide-react'
import { PreviewAvatar } from './avatar'

const columns = [
  { title: 'To do', tickets: ['Connect billing', 'Update account details'] },
  { title: 'In progress', tickets: ['Review onboarding', 'Add project filters'] },
  { title: 'Complete', tickets: ['Invite team members', 'Resolve sign-in issue'] },
]

function Ticket({ title, label, number }: { title: string; label: string; number: number }) {
  return (
    <div className="mb-[7px] rounded-[4px] border border-line bg-surface-strong px-1.5 py-2">
      <span className="text-[5px] text-sea-ink-soft">{label}</span>
      <strong className="mt-[9px] mb-3.5 block text-[8px] leading-[1.5]">{title}</strong>
      <span className="flex items-center justify-between text-[7px] text-sea-ink-soft">
        #{number}
        <PreviewAvatar className="size-4 text-[6px]" />
      </span>
    </div>
  )
}

export function TicketsPreview() {
  return (
    <div className="grid grid-cols-3 gap-[7px]">
      {columns.map((column, index) => (
        <div key={column.title} className="rounded-[4px] bg-brand-tint p-[5px]">
          <small className="mt-1.5 mb-2.5 flex items-center gap-[3px] text-[7px]">
            <Circle size={8} />
            {column.title}
          </small>
          {column.tickets.map((title, item) => (
            <Ticket
              key={title}
              title={title}
              label={item ? 'IMPROVEMENT' : 'CUSTOMER'}
              number={120 + index * 2 + item}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
