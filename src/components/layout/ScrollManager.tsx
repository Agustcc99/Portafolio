import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'
import { isLocale, switchLocalePath } from '../../i18n/paths'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import { ensureSectionsMounted, hasPendingSections } from '../../lib/deferred'
import { routeCommitted } from '../../lib/viewTransition'

/** Misma página en otro idioma (`/es/proyectos/x` ↔ `/en/projects/x`). */
function isLocaleSwitch(from: string, to: string) {
  const [, fromLocale] = from.split('/')
  const [, toLocale] = to.split('/')
  if (!isLocale(fromLocale) || !isLocale(toLocale) || fromLocale === toLocale) return false
  return switchLocalePath(from, 'es') === switchLocalePath(to, 'es')
}

/**
 * Enlace directo a una sección diferida (`/es#contact`): el navegador salta al ancla en cuanto existe, cuando
 * la sección todavía es un espacio vacío, y al montarse el contenido todo se corre de lugar. Se oculta la
 * página (`html[data-anchoring]`, ver effects.css) hasta que las secciones están montadas y el scroll en su sitio.
 */
function scrollToInitialAnchor(hash: string, scrollTo: (target: string, options: { immediate: boolean }) => void) {
  const target = document.querySelector(hash)
  if (!target || !hasPendingSections(target)) return scrollTo(hash, { immediate: true })

  const root = document.documentElement
  root.dataset.anchoring = ''
  const release = () => requestAnimationFrame(() => delete root.dataset.anchoring)
  // Red de seguridad: si algo no monta, la página no puede quedar oculta.
  const timeout = window.setTimeout(release, 2500)
  void ensureSectionsMounted(target).then(() => {
    scrollTo(hash, { immediate: true })
    window.clearTimeout(timeout)
    release()
  })
}

/**
 * Acomoda el scroll en cada navegación: ancla (`#about`) con scroll suave, página nueva arriba,
 * cambio de idioma conservando la posición, cambios de query sin mover el scroll, atrás/adelante
 * a cargo del navegador.
 * Al terminar avisa a la view transition de ruta que la vista nueva ya está lista.
 */
export function ScrollManager() {
  const { pathname, search, hash, key } = useLocation()
  const navigationType = useNavigationType()
  const { scrollTo } = useSmoothScroll()
  const previousPath = useRef<string | null>(null)
  const previousSearch = useRef(search)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      lastScrollY.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    const from = previousPath.current
    const searchChanged = previousSearch.current !== search
    previousPath.current = pathname
    previousSearch.current = search

    if (from === null) {
      if (hash) scrollToInitialAnchor(hash, scrollTo)
    } else if (navigationType === 'POP') {
      if (hash) scrollTo(hash, { immediate: true })
    } else if (from === pathname) {
      // Solo cambió la query (filtros del índice): la página sigue donde está.
      if (hash) scrollTo(hash)
      else if (!searchChanged) scrollTo(0)
    } else if (isLocaleSwitch(from, pathname)) {
      scrollTo(lastScrollY.current, { immediate: true })
    } else if (hash) {
      scrollTo(hash, { immediate: true })
    } else {
      scrollTo(0, { immediate: true })
    }

    routeCommitted()
    // Solo cuando cambia la navegación; `scrollTo` es estable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return null
}
