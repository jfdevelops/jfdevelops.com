import { ArrowDown, ArrowUpRight, Check } from 'lucide-react'
import { CallToAction } from '../-components/call-to-action'
import { DeliveryNote } from '../-components/delivery-note'
import { Eyebrow } from '../-components/eyebrow'
import { SoftwarePreview } from '../-components/software-preview/software-preview'
import { StatusDot } from '../-components/status-dot'
import { TextLink } from '../-components/text-link'

const foundations = ['React & TypeScript', 'APIs & integrations', 'Data & dashboards']

function HeroVisual() {
  return (
    <div className="relative min-w-0 rounded-[12px] bg-brand-tint bg-[radial-gradient(#88888818_1px,transparent_1px)] bg-size-[18px_18px] px-6 pt-[30px] pb-[70px] shadow-[inset_0_0_0_1px_#ffffff10] max-[900px]:px-4 max-[900px]:pt-[22px] max-[900px]:pb-[55px] max-md:mt-2.5 max-md:px-6 max-md:pt-7 max-md:pb-16">
      <div className="mb-[27px] flex justify-between text-[9px] tracking-[0.12em] text-sea-ink-soft">
        <span>FROM IDEA TO EVERYDAY ESSENTIAL</span>
        <span aria-hidden="true">↗</span>
      </div>
      <SoftwarePreview variant="dashboard" className="-rotate-2 shadow-[0_18px_40px_#00000014]" />
      <DeliveryNote />
      <span
        className="absolute right-6 bottom-[23px] font-[monospace] text-[12px] text-sea-ink-soft"
        aria-hidden="true"
      >
        &lt;built for you /&gt;
      </span>
    </div>
  )
}

function HeroFoundation() {
  return (
    <div className="col-span-full flex items-center justify-between gap-6 border-y border-line py-[26px] text-[12px] text-sea-ink-soft max-[900px]:flex-wrap max-md:grid max-md:grid-cols-2 max-md:gap-5 max-md:text-[11px]">
      <span>
        Thoughtfully built.
        <br />
        <strong className="font-semibold text-sea-ink">From front to back.</strong>
      </span>
      {foundations.map((foundation) => (
        <span key={foundation}>{foundation}</span>
      ))}
      <TextLink
        to="/"
        hash="process"
        className="flex gap-2 text-[12px] max-md:col-span-full max-md:text-[11px]"
      >
        A clear path to launch <ArrowUpRight size={16} aria-hidden="true" />
      </TextLink>
    </div>
  )
}

export function Hero() {
  return (
    <section
      id="top"
      className="grid grid-cols-[1.1fr_1fr] items-center gap-x-9 gap-y-12 max-[900px]:gap-x-6 max-[900px]:gap-y-8 max-md:grid-cols-1"
    >
      <div>
        <Eyebrow>
          <StatusDot /> Independent developer. Dedicated partner.
        </Eyebrow>
        <h1 className="mt-[26px] mb-[22px] font-display text-[clamp(44px,5.8vw,76px)] leading-[1.04] font-medium tracking-[-0.055em] max-[900px]:text-[52px] max-md:text-[clamp(46px,10vw,68px)]">
          Less busywork.
          <br />
          More <em className="font-medium">possibility.</em>
        </h1>
        <p className="max-w-[490px] text-[17px] leading-[1.8] text-sea-ink-soft max-md:text-[16px]">
          Custom software for the way your business works. I build web apps, internal tools, and
          integrations that turn everyday friction into a better way forward.
        </p>
        <div className="mt-[30px] flex flex-wrap items-center gap-6">
          <CallToAction to="/" hash="contact">
            Let’s build something <ArrowUpRight size={18} aria-hidden="true" />
          </CallToAction>
          <TextLink to="/" hash="case-studies">
            Explore the work <ArrowDown size={16} aria-hidden="true" />
          </TextLink>
        </div>
        <p className="mt-6 flex items-center gap-2 text-[11px] text-sea-ink-soft">
          <Check size={15} aria-hidden="true" className="text-sea-ink" /> One developer, from first
          conversation to launch.
        </p>
      </div>
      <HeroVisual />
      <HeroFoundation />
    </section>
  )
}
