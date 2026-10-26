import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../lib/cn'

/** Cambia el tema con un revelado circular que nace en el propio botón (View Transitions). */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      }}
      aria-label={isDark ? t('a11y.switchToLight') : t('a11y.switchToDark')}
      className={cn(
        'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-pill border border-line-strong bg-surface-1 text-strong',
        'transition-colors duration-(--duration-base) hover:border-accent-text hover:text-accent-text',
        className,
      )}
    >
      {isDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  )
}
