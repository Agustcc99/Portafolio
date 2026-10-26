import { cn } from '../../lib/cn'

/** Monograma "A" de la marca (navbar, footer, intro). */
export function Monogram({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-accent font-display text-lg leading-none font-extrabold text-accent-ink',
        className,
      )}
    >
      A
    </span>
  )
}
