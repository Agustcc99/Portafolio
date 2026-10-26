import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useScrollLock } from '../../hooks/useSmoothScroll'
import { paths, type Locale } from '../../i18n/paths'
import { loadGsap } from '../../lib/gsap'
import { markIntroDone } from '../../lib/intro'
import { Monogram } from './Monogram'
import { normalizePath } from './navItems'

const SEEN_KEY = 'intro-seen'

function notSeenYet() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === null
  } catch {
    return false
  }
}

/**
 * Intro de ≤ 1.1 s: monograma + cortina que se retira hacia arriba. Solo en la primera visita de
 * la sesión, sobre el home y sin movimiento reducido. Se salta con click o cualquier tecla.
 * Es un overlay: el contenido ya está pintado debajo, así que no retrasa el LCP.
 */
export function IntroSequence() {
  const { i18n } = useTranslation()
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  const onHome = normalizePath(pathname) === paths.home(i18n.language as Locale)

  // La decisión se toma una sola vez, al montar.
  const [active, setActive] = useState(() => !reduced && onHome && notSeenYet())
  const overlay = useRef<HTMLDivElement>(null)
  const mark = useRef<HTMLDivElement>(null)
  const skip = useRef<() => void>(() => setActive(false))

  useScrollLock(active)

  useEffect(() => {
    if (!active) markIntroDone()
  }, [active])

  useEffect(() => {
    if (!active) return

    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* sin almacenamiento: la intro puede repetirse en la próxima carga */
    }

    const finish = () => setActive(false)
    // Si GSAP tarda o falla (o la pestaña está en segundo plano), la intro no puede dejar la página tapada.
    let watchdog = window.setTimeout(finish, 3000)
    let cancelled = false
    let kill = () => {}

    loadGsap()
      .then((gsap) => {
        if (cancelled || !overlay.current || !mark.current) return
        window.clearTimeout(watchdog)
        watchdog = window.setTimeout(finish, 2500)
        const timeline = gsap
          .timeline({ onComplete: finish })
          .fromTo(
            mark.current,
            { opacity: 0, scale: 0.8, y: 10 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'expo.out' },
          )
          .to(
            overlay.current,
            { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: 'expo.inOut' },
            '+=0.12',
          )
        skip.current = () => {
          timeline.progress(1)
        }
        kill = () => timeline.kill()
      })
      .catch(finish)

    const onKey = () => skip.current()
    window.addEventListener('keydown', onKey)

    return () => {
      cancelled = true
      window.clearTimeout(watchdog)
      window.removeEventListener('keydown', onKey)
      kill()
      skip.current = finish
    }
  }, [active])

  if (!active) return null

  return (
    <div
      ref={overlay}
      aria-hidden
      onPointerDown={() => skip.current()}
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-bg"
    >
      <div ref={mark} className="opacity-0">
        <Monogram className="size-20 text-5xl" />
      </div>
    </div>
  )
}
