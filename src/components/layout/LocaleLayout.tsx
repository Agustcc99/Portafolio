import { useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'
import { setLanguage } from '../../i18n'
import type { Locale } from '../../i18n/paths'
import { Footer } from './Footer'
import { IntroSequence } from './IntroSequence'
import { Navbar } from './Navbar'
import { PageTransition } from './PageTransition'
import { ScrollManager } from './ScrollManager'
import { SiteBackground } from './SiteBackground'
import { SkipLink } from './SkipLink'
import { ScrollProgress } from '../ui/ScrollProgress'

/**
 * Shell de todas las rutas `/es/*` y `/en/*`: activa el idioma de la URL antes de mostrar nada y
 * aporta navbar, pie, fondo, barra de progreso, intro y gestión del scroll.
 */
export function LocaleLayout({ locale }: { locale: Locale }) {
  const { i18n } = useTranslation()
  const [ready, setReady] = useState(i18n.language === locale)

  // Layout effect: si el idioma ya estaba cargado, el contenido aparece antes del primer pintado.
  useLayoutEffect(() => {
    let cancelled = false
    setLanguage(locale).then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  if (!ready) return null

  return (
    <>
      <SkipLink />
      <SiteBackground />
      <ScrollProgress />
      <Navbar />
      <ScrollManager />
      <IntroSequence />
      <div id="main-content" tabIndex={-1} className="outline-none">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </div>
      <Footer />
    </>
  )
}
