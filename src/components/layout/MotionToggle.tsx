import { useTranslation } from 'react-i18next'
import { useMotionPrefs } from '../../hooks/useReducedMotion'
import { cn } from '../../lib/cn'

/** Interruptor de animaciones. Arranca según el sistema operativo y se recuerda al elegir a mano. */
export function MotionToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { reduced, toggleReduced } = useMotionPrefs()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!reduced}
      onClick={toggleReduced}
      className={cn(
        'group inline-flex h-11 cursor-pointer items-center gap-3 rounded-pill border border-line-strong bg-surface-1 pr-4 pl-3 text-text',
        'transition-colors duration-(--duration-base) hover:border-accent-text hover:text-strong',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-pill border transition-colors duration-(--duration-base)',
          reduced ? 'border-line-strong bg-surface-2' : 'border-accent-text bg-accent-glow',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-3.5 rounded-full transition-transform duration-(--duration-base) ease-out-expo',
            reduced ? 'translate-x-0 bg-muted' : 'translate-x-4 bg-accent-text',
          )}
        />
      </span>
      <span className="font-mono text-label uppercase tracking-[0.12em]">
        {t('motion.label')}
        <span className="text-muted">{` · ${reduced ? t('motion.off') : t('motion.on')}`}</span>
      </span>
    </button>
  )
}
