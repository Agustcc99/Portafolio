import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { attachLenis } from '../lib/gsap'
import { SmoothScrollContext, type SmoothScrollApi } from './smooth-scroll-context'

function resolveTarget(target: string | HTMLElement): HTMLElement | null {
  if (typeof target !== 'string') return target
  try {
    return document.querySelector<HTMLElement>(target)
  } catch {
    return null
  }
}

function scrollPaddingTop() {
  return parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
}

/**
 * Scroll suave con Lenis. Se desactiva con movimiento reducido y en táctil (puntero grueso);
 * en esos casos `scrollTo` cae al scroll nativo. Lenis scrollea el `window` real, así que
 * `useScroll` de Motion y ScrollTrigger funcionan sin adaptaciones.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const coarse = useMediaQuery('(pointer: coarse)')
  const enabled = !reduced && !coarse

  const lenisRef = useRef<Lenis | null>(null)
  const locks = useRef(0)

  useEffect(() => {
    if (!enabled) return
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: false })
    lenisRef.current = lenis
    attachLenis(lenis)
    if (locks.current > 0) lenis.stop()
    return () => {
      attachLenis(null)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled])

  const api = useMemo<SmoothScrollApi>(() => {
    const applyLock = () => {
      const locked = locks.current > 0
      document.documentElement.style.overflow = locked ? 'hidden' : ''
      if (locked) lenisRef.current?.stop()
      else lenisRef.current?.start()
    }

    return {
      scrollTo(target, { immediate = false, offset } = {}) {
        const lenis = lenisRef.current
        if (typeof target === 'number') {
          if (lenis) lenis.scrollTo(target, { immediate, force: true })
          else window.scrollTo({ top: target, behavior: 'instant' })
          return
        }
        const element = resolveTarget(target)
        if (!element) return
        if (lenis) {
          lenis.scrollTo(element, {
            immediate,
            force: true,
            offset: offset ?? -scrollPaddingTop(),
          })
        } else {
          const smooth = !immediate && !document.documentElement.matches('[data-motion="reduce"]')
          element.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' })
        }
      },
      lock() {
        locks.current += 1
        applyLock()
      },
      unlock() {
        locks.current = Math.max(0, locks.current - 1)
        applyLock()
      },
    }
  }, [])

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>
}
