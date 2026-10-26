import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'
import { isLocale, switchLocalePath } from '../../i18n/paths'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import { routeCommitted } from '../../lib/viewTransition'

/** Misma página en otro idioma (`/es/proyectos/x` ↔ `/en/projects/x`). */
function isLocaleSwitch(from: string, to: string) {
  const [, fromLocale] = from.split('/')
  const [, toLocale] = to.split('/')
  if (!isLocale(fromLocale) || !isLocale(toLocale) || fromLocale === toLocale) return false
  return switchLocalePath(from, 'es') === switchLocalePath(to, 'es')
}

/**
 * Acomoda el scroll en cada navegación: ancla (`#about`) con scroll suave, página nueva arriba,
 * cambio de idioma conservando la posición, atrás/adelante a cargo del navegador.
 * Al terminar avisa a la view transition de ruta que la vista nueva ya está lista.
 */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation()
  const navigationType = useNavigationType()
  const { scrollTo } = useSmoothScroll()
  const previousPath = useRef<string | null>(null)
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
    previousPath.current = pathname

    if (from === null) {
      if (hash) scrollTo(hash, { immediate: true })
    } else if (navigationType === 'POP') {
      if (hash) scrollTo(hash, { immediate: true })
    } else if (from === pathname) {
      if (hash) scrollTo(hash)
      else scrollTo(0)
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
