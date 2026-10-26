import type { DependencyList, RefObject } from 'react'
import { useEffect } from 'react'
import type Lenis from 'lenis'

/**
 * GSAP nunca se importa de forma estática: todo pasa por `loadGsap()` / `loadGsapKit()`
 * para que quede en chunks aparte y fuera del bundle inicial.
 */
type GsapCore = typeof import('gsap').gsap
type ScrollTriggerPlugin = typeof import('gsap/ScrollTrigger').ScrollTrigger
type SplitTextPlugin = typeof import('gsap/SplitText').SplitText

export interface GsapKit {
  gsap: GsapCore
  SplitText: SplitTextPlugin
}

let corePromise: Promise<GsapCore> | null = null
const kitPromises: { base: Promise<GsapKit> | null; scroll: Promise<GsapKit> | null } = { base: null, scroll: null }

/** Solo el núcleo de GSAP (intro, timelines simples). */
export function loadGsap(): Promise<GsapCore> {
  corePromise ??= import('gsap').then((mod) => mod.gsap)
  corePromise.catch(() => (corePromise = null)) // permite reintentar si falló la descarga
  return corePromise
}

/**
 * Núcleo + SplitText registrados. Con `scroll` suma ScrollTrigger (y lo enlaza con Lenis si está activo):
 * solo lo necesitan las animaciones disparadas por scroll, así que las páginas que no las usan no lo bajan.
 */
export function loadGsapKit({ scroll = false }: { scroll?: boolean } = {}): Promise<GsapKit> {
  const key = scroll ? 'scroll' : 'base'
  kitPromises[key] ??= Promise.all([
    import('gsap'),
    import('gsap/SplitText'),
    scroll ? import('gsap/ScrollTrigger') : null,
  ]).then(([core, split, st]) => {
    const { gsap } = core
    gsap.registerPlugin(split.SplitText)
    if (st) {
      gsap.registerPlugin(st.ScrollTrigger)
      st.ScrollTrigger.config({ ignoreMobileResize: true })
      scrollTrigger = st.ScrollTrigger
      linkLenis()
    }
    return { gsap, SplitText: split.SplitText }
  })
  kitPromises[key].catch(() => (kitPromises[key] = null))
  return kitPromises[key]
}

/* ── Enlace Lenis ↔ ScrollTrigger ─────────────────────────────────────
 * Lenis scrollea el `window` real, así que ScrollTrigger solo necesita que lo avisemos
 * en cada tick de scroll. El enlace se hace cuando coinciden ambos (GSAP puede cargar
 * antes o después que Lenis) y se deshace al destruir Lenis.
 */
let scrollTrigger: ScrollTriggerPlugin | null = null
let lenisInstance: Lenis | null = null
let unlink: (() => void) | null = null

function linkLenis() {
  unlink?.()
  unlink = null
  if (!scrollTrigger || !lenisInstance) return
  unlink = lenisInstance.on('scroll', scrollTrigger.update)
  scrollTrigger.refresh()
}

export function attachLenis(lenis: Lenis | null) {
  lenisInstance = lenis
  if (lenis) linkLenis()
  else {
    unlink?.()
    unlink = null
  }
}

/* ── Hook con contexto y limpieza ─────────────────────────────────────
 * Ejecuta `setup` dentro de un `gsap.context` (y lo revierte al desmontar o al cambiar
 * las dependencias), tolerando que el módulo cargue después del desmontaje.
 */
interface GsapContextOptions {
  /** Contenedor para acotar los selectores del contexto. */
  scope?: RefObject<Element | null>
  /** `false` omite todo (movimiento reducido, etc.). Por defecto `true`. */
  enabled?: boolean
  /** Se llama si GSAP no pudo descargarse (red caída): mostrar el contenido tal cual. */
  onError?: () => void
  /** Carga también ScrollTrigger (para animaciones disparadas por scroll). */
  scroll?: boolean
}

export function useGsapContext(
  setup: (kit: GsapKit) => void | (() => void),
  deps: DependencyList,
  { scope, enabled = true, onError, scroll = false }: GsapContextOptions = {},
) {
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let context: { revert: () => void } | null = null
    let cleanup: void | (() => void)

    loadGsapKit({ scroll })
      .then((loaded) => {
        if (cancelled) return
        context = loaded.gsap.context(() => {
          cleanup = setup(loaded)
        }, scope?.current ?? undefined)
      })
      .catch(() => {
        if (!cancelled) onError?.()
      })

    return () => {
      cancelled = true
      if (typeof cleanup === 'function') cleanup()
      context?.revert()
    }
    // `setup`, `scope` y `onError` cambian en cada render; las dependencias reales las pasa el llamador.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, scroll, ...deps])
}
