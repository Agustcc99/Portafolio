import { m } from 'motion/react'
import { useId, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router'
import { activateLanguage, preloadLocale } from '../../i18n'
import { locales, saveLocale, switchLocalePath, type Locale } from '../../i18n/paths'
import { cn } from '../../lib/cn'
import { spring } from '../../lib/motion'
import { transitionRoute } from '../../lib/viewTransition'

/**
 * Selector ES | EN. Conserva la página equivalente (y el scroll del home): primero descarga el
 * bundle del idioma nuevo y recién entonces cambia texto y ruta en el mismo render, sin parpadeo.
 */
export function LangSwitch({ className }: { className?: string }) {
  const { t, i18n } = useTranslation('common')
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const indicatorId = useId()
  const current = i18n.language as Locale

  const select = async (event: MouseEvent<HTMLAnchorElement>, locale: Locale) => {
    saveLocale(locale)
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    if (locale === current) return
    await preloadLocale(locale)
    const target = switchLocalePath(pathname, locale, search, hash)
    transitionRoute(() => {
      activateLanguage(locale)
      navigate(target)
    })
  }

  return (
    <nav
      aria-label={t('a11y.language')}
      className={cn(
        'inline-flex items-center rounded-pill border border-line-strong bg-surface-1 p-0.5',
        className,
      )}
    >
      {locales.map((locale) => {
        const active = locale === current
        return (
          <Link
            key={locale}
            to={switchLocalePath(pathname, locale, search, hash)}
            hrefLang={locale}
            lang={locale}
            aria-current={active ? 'true' : undefined}
            aria-label={t(`lang.${locale}`)}
            onClick={(event) => select(event, locale)}
            className={cn(
              'relative isolate inline-flex h-9 min-w-10 items-center justify-center rounded-pill px-2.5 font-mono text-label uppercase tracking-[0.12em] transition-colors duration-(--duration-base)',
              active ? 'text-accent-ink' : 'text-text hover:text-strong',
            )}
          >
            {active && (
              <m.span
                layoutId={indicatorId}
                transition={spring.ui}
                className="absolute inset-0 -z-10 rounded-pill bg-accent"
              />
            )}
            {locale}
          </Link>
        )
      })}
    </nav>
  )
}
