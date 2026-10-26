import type { ComponentPropsWithoutRef, PointerEvent } from 'react'
import { cn } from '../../lib/cn'

/**
 * Tesela con borde de 1 px, highlight superior y un *spotlight* que sigue al puntero:
 * un gradiente radial cuyo centro (`--mx`, `--my`) se actualiza directo en el DOM, sin estado
 * de React. Solo reacciona con ratón (en táctil no hay hover).
 */
export function BentoTile({
  className,
  children,
  onPointerMove,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event)
    if (event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }

  return (
    <div
      onPointerMove={handleMove}
      className={cn(
        'group relative isolate h-full overflow-hidden rounded-lg border border-line bg-surface-1 p-6 sm:p-8',
        'shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition-colors duration-(--duration-slow) hover:border-line-strong',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-(--duration-slow) group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), var(--accent-glow), transparent 70%)',
        }}
      />
      {children}
    </div>
  )
}
