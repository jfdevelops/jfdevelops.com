import { ArrowUpRight, Check } from 'lucide-react'
import { Eyebrow } from '../-components/eyebrow'
import { TextLink } from '../-components/text-link'

const reasons = ['One point of contact', 'Frontend to backend', 'Built for what comes next']

function AboutMark() {
  return (
    <div
      className="flex aspect-square flex-col items-center justify-center rounded-[18%] border border-line text-sea-ink max-md:w-[140px]"
      aria-hidden="true"
    >
      <img
        src="/brand/icon-192.png"
        alt=""
        width={192}
        height={192}
        className="h-auto w-[min(52%,150px)] rounded-[25%] shadow-[0_14px_32px] shadow-brand-accent/20"
      />
      <small className="mt-5 text-[8px] tracking-[0.17em] max-md:mt-2.5 max-md:text-[6px]">
        INDEPENDENT BY DESIGN
      </small>
    </div>
  )
}

function AboutParagraph({ children }: { children: string }) {
  return <p className="mb-3.5 text-[14px] leading-[1.8] text-sea-ink-soft">{children}</p>
}

export function About() {
  return (
    <section
      id="about"
      className="grid scroll-mt-24 grid-cols-[0.7fr_1.3fr] items-center gap-[60px] rounded-[12px] bg-brand-tint p-[50px] max-[900px]:gap-[30px] max-[900px]:p-8 max-md:grid-cols-1 max-md:p-[30px]"
    >
      <AboutMark />
      <div>
        <Eyebrow>The person behind the pixels</Eyebrow>
        <h2 className="mt-4 mb-[22px] font-display text-[36px] leading-[1.15] tracking-[-0.03em] max-md:text-[31px]">
          A direct line to the person building it.
        </h2>
        <AboutParagraph>
          I’m the full-stack developer behind JF Develops. I work with founders, small teams, and
          growing businesses to turn complex workflows into software that feels straightforward.
        </AboutParagraph>
        <AboutParagraph>
          From the first sketch to the final deployment, you work directly with me. Clear
          communication, thoughtful decisions, and care for the details.
        </AboutParagraph>
        <ul className="my-6 flex flex-wrap gap-x-[18px] gap-y-2.5">
          {reasons.map((reason) => (
            <li key={reason} className="flex items-center gap-1.5 text-[10px] text-sea-ink">
              <Check size={16} aria-hidden="true" />
              {reason}
            </li>
          ))}
        </ul>
        <TextLink to="/" hash="contact">
          Tell me what you have in mind <ArrowUpRight size={17} aria-hidden="true" />
        </TextLink>
      </div>
    </section>
  )
}
