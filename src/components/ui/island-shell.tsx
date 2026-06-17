import type { ComponentPropsWithRef, ElementType } from 'react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

type AsProp<T extends ElementType> = { as?: T };
type PolymorphicProps<T extends ElementType, P = {}> = AsProp<T> &
  Omit<ComponentPropsWithRef<T>, keyof AsProp<T>> &
  P;

export const islandShellVariants = cva(
  'border border-(--line) bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] shadow-[0_1px_0_var(--inset-glint)_inset,0_22px_44px_rgba(20,20,20,0.1),0_6px_18px_rgba(20,20,20,0.08)] backdrop-blur',
);

export function IslandShell<T extends ElementType = 'div'>({
  as,
  className,
  ...props
}: PolymorphicProps<T, { className?: string }>) {
  const Comp = (as ?? 'div') as ElementType;
  return (
    <Comp
      className={cn(islandShellVariants({ className }))}
      {...(props as {})}
    />
  );
}

export function FeatureCard<T extends ElementType = 'div'>({
  as,
  className,
  ...props
}: PolymorphicProps<T, { className?: string }>) {
  const Comp = (as ?? 'div') as ElementType;
  return (
    <Comp
      className={cn(
        'border border-(--line) bg-[linear-gradient(165deg,color-mix(in_oklab,var(--surface-strong)_93%,white_7%),var(--surface))] shadow-[0_1px_0_var(--inset-glint)_inset,0_18px_34px_rgba(20,20,20,0.1),0_4px_14px_rgba(20,20,20,0.06)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--lagoon-deep)_35%,var(--line))]',
        className,
      )}
      {...(props as {})}
    />
  );
}
