import { ArrowUpRight, Check, Circle, Layers, LayoutDashboard, Settings, Users } from 'lucide-react'

export function SoftwarePreview({ variant }: { variant: 'dashboard' | 'form' | 'tickets' }) {
  return (
    <div
      className={`software-preview preview-${variant}`}
      role="img"
      aria-label={`Illustrative ${variant} interface, showing an example of custom software`}
    >
      <div className="window-bar">
        <span className="window-dots" aria-hidden="true">
          ● ● ●
        </span>
        <span>
          workspace /{' '}
          {variant === 'dashboard' ? 'overview' : variant === 'form' ? 'onboarding' : 'support'}
        </span>
        <span aria-hidden="true">↗</span>
      </div>
      <div className="workspace">
        <div className="workspace-sidebar" aria-hidden="true">
          <img
            className="workspace-monogram"
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
        <div className="workspace-content">
          <div className="workspace-title">
            <div>
              <small>YOUR BUSINESS, CONNECTED</small>
              <strong>
                {variant === 'dashboard'
                  ? 'A clearer picture.'
                  : variant === 'form'
                    ? 'A better first step.'
                    : 'Everything in its place.'}
              </strong>
            </div>
            <span className="avatar">JF</span>
          </div>
          {variant === 'dashboard' && (
            <>
              <div className="metric-row">
                <div>
                  <span>Projects in motion</span>
                  <strong>
                    12 <ArrowUpRight size={17} />
                  </strong>
                </div>
                <div>
                  <span>Tasks completed</span>
                  <strong>
                    84 <span className="metric-note">This week</span>
                  </strong>
                </div>
              </div>
              <div className="chart-card">
                <div>
                  <strong>Work, moving forward</strong>
                  <span>Weekly activity</span>
                </div>
                <div className="bar-chart" aria-hidden="true">
                  {[34, 52, 43, 68, 58, 83, 95, 73, 88, 100, 86, 112].map((height) => (
                    <i key={height} style={{ height }} />
                  ))}
                </div>
                <div className="chart-axis">
                  <span>MON</span>
                  <span>WED</span>
                  <span>FRI</span>
                </div>
              </div>
              <div className="workspace-task">
                <span>
                  <Check size={13} /> Customer onboarding
                </span>
                <span className="preview-tag">Connected</span>
              </div>
            </>
          )}
          {variant === 'form' && (
            <>
              <div className="form-progress">
                <span>01 About you</span>
                <span>02 Your project</span>
                <span>03 Review</span>
              </div>
              <div className="illustrated-form">
                <span>Let’s get acquainted.</span>
                <small>Company name</small>
                <div>Acme Studio</div>
                <small>What are you building?</small>
                <div>A better customer experience</div>
                <p>
                  Continue <ArrowUpRight size={15} />
                </p>
              </div>
            </>
          )}
          {variant === 'tickets' && (
            <div className="kanban">
              {['To do', 'In progress', 'Complete'].map((column, index) => (
                <div key={column}>
                  <small>
                    <Circle size={8} />
                    {column}
                  </small>
                  {[0, 1].map((item) => (
                    <div className="kanban-card" key={item}>
                      <span className="ticket-label">{item ? 'IMPROVEMENT' : 'CUSTOMER'}</span>
                      <strong>
                        {
                          [
                            ['Connect billing', 'Update account details'],
                            ['Review onboarding', 'Add project filters'],
                            ['Invite team members', 'Resolve sign-in issue'],
                          ][index][item]
                        }
                      </strong>
                      <span className="ticket-footer">
                        #{120 + index * 2 + item}
                        <span className="avatar">JF</span>
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          <span className="illustration-label">Illustrative interface · Sample data</span>
        </div>
      </div>
    </div>
  )
}
