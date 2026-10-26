import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../lib/cn'

/** Provisional: el revelado circular con View Transitions llega en la Fase 4. */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t('a11y.switchToLight') : t('a11y.switchToDark')}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-pill border border-line-strong bg-surface-1 text-strong',
        'transition-colors duration-(--duration-base) hover:border-accent-text hover:text-accent-text',
        className,
      )}
    >
      {isDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  )
}
