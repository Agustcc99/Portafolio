import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'
import { setLanguage } from '../../i18n'
import { paths, type Locale } from '../../i18n/paths'
import { LangSwitch } from './LangSwitch'
import { ThemeToggle } from './ThemeToggle'

/**
 * Activa el idioma de la ruta (`/es/*`, `/en/*`) antes de mostrar el contenido.
 * La barra flotante es provisional: la navegación definitiva llega en la Fase 4.
 */
export function LocaleLayout({ locale }: { locale: Locale }) {
  const { t, i18n } = useTranslation()
  const [ready, setReady] = useState(i18n.language === locale)

  useEffect(() => {
    let cancelled = false
    setLanguage(locale).then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  if (!ready || i18n.language !== locale) return null

  return (
    <>
      <Outlet />
      <div className="fixed right-3 bottom-3 z-50 flex items-center gap-2 rounded-pill border border-line-strong bg-surface-1 p-1.5 shadow-lg">
        <Link
          to={paths.home(locale)}
          className="rounded-pill px-3 py-2 font-mono text-label uppercase tracking-[0.12em] text-text hover:text-strong"
        >
          {t('nav.home')}
        </Link>
        <Link
          to={paths.projects(locale)}
          className="rounded-pill px-3 py-2 font-mono text-label uppercase tracking-[0.12em] text-text hover:text-strong"
        >
          {t('nav.projects')}
        </Link>
        <LangSwitch />
        <ThemeToggle className="size-9" />
      </div>
    </>
  )
}
