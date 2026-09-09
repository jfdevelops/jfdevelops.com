import { ArrowDown, ArrowUpRight, Check } from 'lucide-react'
import { SoftwarePreview } from './software-preview'

export function Hero() {
  return (
    <section id="top" className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="status-dot" /> Independent developer. Dedicated partner.
        </p>
        <h1>
          Less busywork.
          <br />
          More <em>possibility.</em>
        </h1>
        <p className="hero-description">
          Custom software for the way your business works. I build web apps, internal tools, and
          integrations that turn everyday friction into a better way forward.
        </p>
        <div className="hero-actions">
          <a href="#contact" className="brand-button">
            Let’s build something <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <a href="#case-studies" className="text-link">
            Explore the work <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
        <p className="hero-note">
          <Check size={15} aria-hidden="true" /> One developer, from first conversation to launch.
        </p>
      </div>
      <div className="hero-visual">
        <div className="visual-caption">
          <span>FROM IDEA TO EVERYDAY ESSENTIAL</span>
          <span aria-hidden="true">↗</span>
        </div>
        <SoftwarePreview variant="dashboard" />
        <div className="delivery-note">
          <span className="delivery-icon">
            <Check size={19} aria-hidden="true" />
          </span>
          <div>
            <strong>Built around your workflow.</strong>
            <span>Connected. Considered. Yours.</span>
          </div>
        </div>
        <span className="visual-code" aria-hidden="true">
          &lt;built for you /&gt;
        </span>
      </div>
      <div className="hero-foundation">
        <span>
          Thoughtfully built.
          <br />
          <strong>From front to back.</strong>
        </span>
        <span>React & TypeScript</span>
        <span>APIs & integrations</span>
        <span>Data & dashboards</span>
        <a href="#process">
          A clear path to launch <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
