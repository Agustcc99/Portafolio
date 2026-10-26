import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { cn } from '../../lib/cn'

type ContainerProps<T extends ElementType> = { as?: T } & ComponentPropsWithoutRef<T>

export function Container<T extends ElementType = 'div'>({
  as,
  className,
  ...props
}: ContainerProps<T>) {
  const Tag: ElementType = as ?? 'div'
  return (
    <Tag
      className={cn('mx-auto w-full max-w-[1280px] px-[clamp(1rem,4vw,3rem)]', className)}
      {...props}
    />
  )
}
