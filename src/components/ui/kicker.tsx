import { type ComponentPropsWithRef, type ElementType } from 'react'
import { cn } from '#/lib/utils'

type AsProp<T extends ElementType> = { as?: T }
type PolymorphicProps<T extends ElementType, P = {}> = AsProp<T> &
  Omit<ComponentPropsWithRef<T>, keyof AsProp<T>> &
  P

export function Kicker<T extends ElementType = 'p'>({
  as,
  className,
  ...props
}: PolymorphicProps<T, { className?: string }>) {
  const Comp = (as ?? 'p') as ElementType
  return (
    <Comp
      className={cn(
        'text-[0.69rem] font-bold uppercase tracking-[0.16em] text-[var(--kicker)]',
        className,
      )}
      {...(props as {})}
    />
  )
}
