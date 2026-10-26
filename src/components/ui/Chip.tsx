import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Resalta el chip con el acento (estado activo / destacado). */
  active?: boolean
}

export function Chip({ active, className, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill border px-3 py-1 font-mono text-label uppercase tracking-[0.12em]',
        active
          ? 'border-accent-text bg-accent-glow text-accent-text'
          : 'border-line bg-surface-1 text-text',
        className,
      )}
      {...props}
    />
  )
}
