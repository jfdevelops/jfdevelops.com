import { ArrowUpRight, Check } from 'lucide-react'

export function About() {
  return (
    <section id="about" className="about-band scroll-mt-24">
      <div className="about-mark" aria-hidden="true">
        <span>&lt;JF /&gt;</span>
        <small>INDEPENDENT BY DESIGN</small>
      </div>
      <div>
        <p className="eyebrow">The person behind the pixels</p>
        <h2>A direct line to the person building it.</h2>
        <p>
          I’m the full-stack developer behind JF Develops. I work with founders, small teams, and
          growing businesses to turn complex workflows into software that feels straightforward.
        </p>
        <p>
          From the first sketch to the final deployment, you work directly with me. Clear
          communication, thoughtful decisions, and care for the details.
        </p>
        <ul>
          {['One point of contact', 'Frontend to backend', 'Built for what comes next'].map(
            (reason) => (
              <li key={reason}>
                <Check size={16} aria-hidden="true" />
                {reason}
              </li>
            ),
          )}
        </ul>
        <a className="text-link" href="#contact">
          Tell me what you have in mind <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
