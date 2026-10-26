import type { HTMLAttributes } from 'react'
import { chipClasses } from './chipClasses'

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Resalta el chip con el acento (estado activo / destacado). */
  active?: boolean
}

export function Chip({ active, className, ...props }: ChipProps) {
  return <span className={chipClasses(active, className)} {...props} />
}
