import { Suspense, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { getForcedAll, markLoaded, subscribeForced, wasLoaded } from '../../lib/deferred'

interface DeferredSectionProps {
  /** Id del ancla (`#projects`): el `<section>` existe siempre, aunque su contenido no. */
  id: string
  className?: string
  /** Alto reservado mientras el contenido no existe, para que el scroll no salte al montarlo. */
  reserve?: string
  /** Descarga el chunk del contenido sin montarlo (se llama cuando el navegador está ocioso). */
  prefetch: () => Promise<unknown>
  /** Segundos tras la carga para montar el contenido aunque nadie haya llegado hasta acá. */
  idleDelay?: number
  /** `id` del título que nombra la sección; se publica recién cuando el contenido existe. */
  labelledBy?: string
  /** Elemento perezoso (`React.lazy`) con el contenido de la sección. */
  children: ReactNode
}

function afterIdle(callback: () => void, delayMs: number) {
  const run = () => ('requestIdleCallback' in window ? window.requestIdleCallback(callback) : callback())
  return window.setTimeout(run, delayMs)
}

/**
 * Sección del home cuyo contenido pesado (carrusel, mapa, portal) se descarga y monta tarde:
 * al acercarse a la pantalla, cuando algo salta a un ancla (`ensureSectionsMounted`) o, como
 * respaldo para buscar con Ctrl+F y para los rastreadores, unos segundos después de cargar.
 * El `<section>` con su `id` es estable, así que el scroll-spy y los anclas no se enteran.
 */
export function DeferredSection({
  id,
  className,
  reserve = '100svh',
  prefetch,
  idleDelay = 4,
  labelledBy,
  children,
}: DeferredSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const forced = useSyncExternalStore(subscribeForced, getForcedAll, () => false)
  const [near, setNear] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const show = forced || near || wasLoaded(id)

  // Cuando la sección está a una pantalla de distancia (o ya se vio), se monta.
  useEffect(() => {
    const element = ref.current
    if (!element || show) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true)
      },
      { rootMargin: '100% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [show])

  // Descarga anticipada del chunk y montaje de respaldo; ambos esperan a que el navegador esté libre.
  useEffect(() => {
    if (show) return
    const timers = [afterIdle(() => void prefetch(), 1000), afterIdle(() => setNear(true), idleDelay * 1000)]
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [show, prefetch, idleDelay])

  return (
    <section
      ref={ref}
      id={id}
      data-deferred=""
      data-loaded={loaded ? '' : undefined}
      aria-labelledby={loaded ? labelledBy : undefined}
      style={loaded ? undefined : { minHeight: reserve }}
      className={className}
    >
      {show && (
        <Suspense fallback={null}>
          {children}
          <Mounted
            onMount={() => {
              markLoaded(id)
              setLoaded(true)
            }}
          />
        </Suspense>
      )}
    </section>
  )
}

/** Se monta recién cuando el contenido perezoso que lo precede terminó de cargarse. */
function Mounted({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount()
    // `onMount` solo cambia de identidad entre renders; basta con avisar una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
