import { cn } from '../../lib/cn'

/** Clases de chip reutilizables (el `<Chip>` es un `<span>`; los filtros son `<button>`). */
export function chipClasses(active?: boolean, className?: string) {
  return cn(
    'inline-flex items-center rounded-pill border px-3 py-1 font-mono text-label uppercase tracking-[0.12em]',
    active
      ? 'border-accent-text bg-accent-glow text-accent-text'
      : 'border-line bg-surface-1 text-text',
    className,
  )
}
