import { type ComponentPropsWithRef, type ElementType } from 'react'
import { cn } from '#/lib/utils'

type AsProp<T extends ElementType> = { as?: T }
type PolymorphicProps<T extends ElementType, P = {}> = AsProp<T> &
  Omit<ComponentPropsWithRef<T>, keyof AsProp<T>> &
  P

export function PageWrap<T extends ElementType = 'div'>({
  as,
  className,
  ...props
}: PolymorphicProps<T, { className?: string }>) {
  const Comp = (as ?? 'div') as ElementType
  return (
    <Comp
      className={cn('mx-auto w-[min(1080px,calc(100%-2rem))]', className)}
      {...(props as {})}
    />
  )
}
