import { createPolymorphicComponent } from '@/components/polymorphic-component';
import { cn } from '@/lib/utils';

const createShellComponent = createPolymorphicComponent(
  'div',
  ({ className, ...props }, { Component, createProps }) => (
    <Component
      {...createProps(props, {
        className: cn('border border-(--line) backdrop-blur', className),
      })}
    />
  ),
);

export const IslandShell = createShellComponent(function IslandShell(
  { className, ...props },
  { Component, createProps },
) {
  return (
    <Component
      {...createProps(props, {
        className: cn('bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] shadow-[0_1px_0_var(--inset-glint)_inset,0_22px_44px_rgba(20,20,20,0.1),0_6px_18px_rgba(20,20,20,0.08)]', className),
      })}
    />
  );
});

export const FeatureCard = createShellComponent(function FeatureCard(
  { className, ...props },
  { Component, createProps },
) {
  return (
    <Component
      {...createProps(props, {
        className: cn(
          'bg-[linear-gradient(165deg,color-mix(in_oklab,var(--surface-strong)_93%,white_7%),var(--surface))] shadow-[0_1px_0_var(--inset-glint)_inset,0_18px_34px_rgba(20,20,20,0.1),0_4px_14px_rgba(20,20,20,0.06)] transition hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--lagoon-deep)_35%,var(--line))]',
          className,
        ),
      })}
    />
  );
});
