import { createPolymorphicComponent } from '@/components/polymorphic-component'
import { cn } from '@/lib/utils'

const createShellComponent = createPolymorphicComponent(
  'div',
  ({ className, ...props }, { Component, createProps }) => (
    <Component
      {...createProps(props, {
        className: cn('border border-(--line)', className),
      })}
    />
  ),
)

export const IslandShell = createShellComponent(function IslandShell(
  { className, ...props },
  { Component, createProps },
) {
  return (
    <Component
      {...createProps(props, {
        className: cn('bg-(--surface-strong) shadow-[0_4px_20px_rgba(15,55,42,0.03)]', className),
      })}
    />
  )
})

export const FeatureCard = createShellComponent(function FeatureCard(
  { className, ...props },
  { Component, createProps },
) {
  return (
    <Component
      {...createProps(props, {
        className: cn('bg-(--surface-strong) transition-colors hover:border-(--lagoon)', className),
      })}
    />
  )
})
