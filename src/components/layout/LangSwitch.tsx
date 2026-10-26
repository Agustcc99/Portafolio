import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { locales, saveLocale, switchLocalePath, type Locale } from '../../i18n/paths'
import { cn } from '../../lib/cn'

/** Provisional: el diseño definitivo llega en la Fase 4. */
export function LangSwitch({ className }: { className?: string }) {
  const { t, i18n } = useTranslation('common')
  const { pathname, search, hash } = useLocation()
  const current = i18n.language as Locale
  const label = t('a11y.language')

  return (
    <nav aria-label={label} className={cn('flex items-center gap-1', className)}>
      {locales.map((locale) => (
        <Link
          key={locale}
          to={switchLocalePath(pathname, locale, search, hash)}
          hrefLang={locale}
          lang={locale}
          aria-current={locale === current ? 'true' : undefined}
          aria-label={locale === 'es' ? t('lang.es') : t('lang.en')}
          onClick={() => saveLocale(locale)}
          className={cn(
            'inline-flex h-9 min-w-9 items-center justify-center rounded-pill px-2 font-mono text-label uppercase tracking-[0.12em] transition-colors',
            locale === current
              ? 'bg-accent text-accent-ink'
              : 'text-text hover:text-strong',
          )}
        >
          {locale}
        </Link>
      ))}
    </nav>
  )
}
