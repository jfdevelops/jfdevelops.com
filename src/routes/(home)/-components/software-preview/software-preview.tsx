import { DashboardPreview } from './dashboard'
import { OnboardingPreview } from './onboarding'
import { TicketsPreview } from './tickets'
import { PreviewWindow } from './window'

const variants = {
  dashboard: { path: 'overview', heading: 'A clearer picture.', Content: DashboardPreview },
  form: { path: 'onboarding', heading: 'A better first step.', Content: OnboardingPreview },
  tickets: { path: 'support', heading: 'Everything in its place.', Content: TicketsPreview },
}

type SoftwarePreviewProps = {
  variant: keyof typeof variants
  className?: string
}

export function SoftwarePreview({ variant, className }: SoftwarePreviewProps) {
  const { path, heading, Content } = variants[variant]

  return (
    <PreviewWindow
      path={path}
      heading={heading}
      className={className}
      aria-label={`Illustrative ${variant} interface, showing an example of custom software`}
    >
      <Content />
    </PreviewWindow>
  )
}
