import type Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { ensureSectionsMounted, hasPendingSections } from '../lib/deferred'
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

  // Lenis se descarga aparte (no hace falta para el primer pintado ni en táctil); mientras tanto el scroll es el nativo.
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let instance: Lenis | null = null
    void import('lenis').then(({ default: LenisClass }) => {
      if (cancelled) return
      instance = new LenisClass({ lerp: 0.1, smoothWheel: true, anchors: false, autoRaf: true })
      lenisRef.current = instance
      attachLenis(instance)
      if (locks.current > 0) instance.stop()
    })
    return () => {
      cancelled = true
      attachLenis(null)
      instance?.destroy()
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

    const scrollTo: SmoothScrollApi['scrollTo'] = (target, { immediate = false, offset } = {}) => {
      const lenis = lenisRef.current
      if (typeof target === 'number') {
        if (lenis) lenis.scrollTo(target, { immediate, force: true })
        else window.scrollTo({ top: target, behavior: 'instant' })
        return
      }
      const element = resolveTarget(target)
      if (!element) return
      // Las secciones diferidas del home no tienen su alto real hasta montarse: se montan antes de medir el destino.
      if (hasPendingSections(element)) {
        void ensureSectionsMounted(element).then(() => scrollTo(target, { immediate, offset }))
        return
      }
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
    }

    return {
      scrollTo,
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
