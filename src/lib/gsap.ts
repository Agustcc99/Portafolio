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
  ScrollTrigger: ScrollTriggerPlugin
  SplitText: SplitTextPlugin
}

let corePromise: Promise<GsapCore> | null = null
let kitPromise: Promise<GsapKit> | null = null

/** Solo el núcleo de GSAP (intro, timelines simples). */
export function loadGsap(): Promise<GsapCore> {
  corePromise ??= import('gsap').then((mod) => mod.gsap)
  corePromise.catch(() => (corePromise = null)) // permite reintentar si falló la descarga
  return corePromise
}

/** Núcleo + ScrollTrigger + SplitText registrados, y enlazado con Lenis si está activo. */
export function loadGsapKit(): Promise<GsapKit> {
  kitPromise ??= Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/SplitText'),
  ]).then(([core, st, split]) => {
    const { gsap } = core
    gsap.registerPlugin(st.ScrollTrigger, split.SplitText)
    st.ScrollTrigger.config({ ignoreMobileResize: true })
    kit = { gsap, ScrollTrigger: st.ScrollTrigger, SplitText: split.SplitText }
    linkLenis()
    return kit
  })
  kitPromise.catch(() => (kitPromise = null))
  return kitPromise
}

/* ── Enlace Lenis ↔ ScrollTrigger ─────────────────────────────────────
 * Lenis scrollea el `window` real, así que ScrollTrigger solo necesita que lo avisemos
 * en cada tick de scroll. El enlace se hace cuando coinciden ambos (GSAP puede cargar
 * antes o después que Lenis) y se deshace al destruir Lenis.
 */
let kit: GsapKit | null = null
let lenisInstance: Lenis | null = null
let unlink: (() => void) | null = null

function linkLenis() {
  unlink?.()
  unlink = null
  if (!kit || !lenisInstance) return
  const { ScrollTrigger } = kit
  const stop = lenisInstance.on('scroll', ScrollTrigger.update)
  unlink = stop
  ScrollTrigger.refresh()
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
}

export function useGsapContext(
  setup: (kit: GsapKit) => void | (() => void),
  deps: DependencyList,
  { scope, enabled = true, onError }: GsapContextOptions = {},
) {
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let context: { revert: () => void } | null = null
    let cleanup: void | (() => void)

    loadGsapKit()
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
  }, [enabled, ...deps])
}
