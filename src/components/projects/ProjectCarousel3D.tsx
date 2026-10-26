import { ArrowLeft, ArrowRight } from 'lucide-react'
import {
  m,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { ProjectData } from '../../content/projects'
import { useContentText } from '../../hooks/useContentText'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cn } from '../../lib/cn'
import { ProjectCard } from './ProjectCard'
import './ProjectCarousel3D.css'

// ── Constantes de tuning ─────────────────────────────────────────────────
const ANCHO_SLOT_POR_DEFECTO: number = 560
/** Separación entre slots contiguos, como fracción de su ancho. */
const PASO_RATIO: number = 0.62
const ROTACION_MAXIMA: number = 32
const PROFUNDIDAD_PASO: number = 170
const ESCALA_PASO: number = 0.18
const OPACIDAD_PASO: number = 0.4
/** Fracción de un paso que hay que arrastrar (con la proyección de la inercia) para cambiar de slide. */
const UMBRAL_ARRASTRE_RATIO: number = 0.3
const UMBRAL_CLICK_PX: number = 5
const MARGEN_ALTURA_VIEWPORT: number = 40
/** Resorte de la inercia (Motion). Algo más blando que `spring.ui` para que el coverflow "respire". */
const RESORTE_CARRUSEL = { stiffness: 190, damping: 26, mass: 0.9, restDelta: 0.001 } as const
/** Cuánto "adelante" se proyecta la velocidad del gesto al soltar (segundos) para decidir el snap. */
const PROYECCION_INERCIA_S: number = 0.14
/** Máximo de slides que puede avanzar un solo gesto, por rápido que sea el flick. */
const MAX_SLIDES_POR_GESTO: number = 2
/** Ventana de muestras para estimar la velocidad al soltar. */
const VENTANA_VELOCIDAD_MS: number = 90
/** Multiplicador del arrastre pasado el primer/último slide (resistencia elástica). */
const RESISTENCIA_BORDE: number = 0.35
/** Distancia (en slides) al activo hasta la que se renderiza la tarjeta completa. */
const RADIO_RENDER: number = 3
/** Distancia (en slides) desde la que un slot deja de recibir clics. */
const RADIO_CLICK: number = 2
/** Desplazamiento horizontal acumulado de la rueda/trackpad para cambiar de slide. */
const UMBRAL_RUEDA_PX: number = 36
/** Silencio entre eventos de rueda que cierra un gesto (evita varios pasos por una sola inercia). */
const SILENCIO_RUEDA_MS: number = 140

interface ProjectCarousel3DProps {
  projects: readonly ProjectData[]
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** Transformación 3D del slot según su distancia (fraccionaria) al centro. */
function slotTransform(offset: number, step: number) {
  const distance = Math.min(Math.abs(offset), RADIO_RENDER)
  const sign = Math.sign(offset)
  const rotation = sign * distance * -ROTACION_MAXIMA
  const depth = -distance * PROFUNDIDAD_PASO
  const scale = Math.max(1 - distance * ESCALA_PASO, 0.5)
  return `translate(-50%, -50%) translateX(${offset * step}px) translateZ(${depth}px) rotateY(${rotation}deg) scale(${scale})`
}

interface SlotProps {
  index: number
  position: MotionValue<number>
  step: MotionValue<number>
  active: boolean
  rendered: boolean
  clickable: boolean
  label: string
  slotRef: (element: HTMLDivElement | null) => void
  onSelect: () => void
  children: ReactNode
}

/** Un slide: su pose se deriva de `position` sin pasar por React, así el spring no re-renderiza. */
function Slot({
  index,
  position,
  step,
  active,
  rendered,
  clickable,
  label,
  slotRef,
  onSelect,
  children,
}: SlotProps) {
  const transform = useTransform<number, string>([position, step], ([p = 0, s = 0]) =>
    slotTransform(index - p, s),
  )
  const opacity = useTransform(position, (p) =>
    Math.max(1 - Math.min(Math.abs(index - p), RADIO_RENDER) * OPACIDAD_PASO, 0),
  )
  const zIndex = useTransform(position, (p) => 100 - Math.round(Math.abs(index - p) * 10))

  return (
    <m.div
      ref={slotRef}
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      aria-hidden={!active}
      className={cn('project-carousel__slot', active && 'project-carousel__slot--active')}
      style={{
        transform,
        opacity,
        zIndex,
        pointerEvents: clickable ? 'auto' : 'none',
        willChange: rendered ? 'transform, opacity' : undefined,
      }}
      onClick={onSelect}
    >
      {/* `inert` en los slides no activos: sin foco ni lector de pantalla; el clic cae en el slot y lo centra. */}
      <div inert={!active} className="h-full">
        {rendered ? children : null}
      </div>
    </m.div>
  )
}

/**
 * Carrusel *coverflow* 3D de proyectos. La posición es un valor continuo (`position`, en slides)
 * movido por un spring de Motion: al arrastrar se fija directo y al soltar se proyecta la inercia
 * y se hace snap al slide más cercano. También responde a teclado (←/→, Home/End), a la rueda o
 * trackpad horizontal, a flechas y a puntos. Sin autoplay.
 */
export function ProjectCarousel3D({ projects }: ProjectCarousel3DProps) {
  const { t } = useTranslation('home')
  const { project: text } = useContentText()
  const reduced = useReducedMotion()
  const total = projects.length

  const [active, setActive] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [viewportHeight, setViewportHeight] = useState<number | null>(null)

  const position = useSpring(0, RESORTE_CARRUSEL)
  const step = useMotionValue(ANCHO_SLOT_POR_DEFECTO * PASO_RATIO)

  const viewport = useRef<HTMLDivElement>(null)
  const slots = useRef<(HTMLDivElement | null)[]>([])
  const activeRef = useRef(0)
  const gesture = useRef({
    pointerId: 0,
    pressed: false,
    moved: false,
    startX: 0,
    startPosition: 0,
    startIndex: 0,
    samples: [] as { time: number; x: number }[],
    suppressClick: false,
  })

  const goTo = useCallback(
    (target: number) => {
      const index = clamp(Math.round(target), 0, total - 1)
      activeRef.current = index
      setActive(index)
      if (reduced) position.jump(index)
      else position.set(index)
    },
    [position, reduced, total],
  )

  // La altura sale de la tarjeta más alta entre las renderizadas (no del slide activo) para que no
  // salte al navegar; el paso sale del ancho real del slot, que cambia con el viewport.
  useLayoutEffect(() => {
    const measure = () => {
      const heights = slots.current.map((element) => element?.offsetHeight ?? 0)
      const height = Math.max(0, ...heights)
      if (height) setViewportHeight(height + MARGEN_ALTURA_VIEWPORT)
      const width = slots.current[0]?.offsetWidth || ANCHO_SLOT_POR_DEFECTO
      step.set(width * PASO_RATIO)
    }
    measure()
    const observer = new ResizeObserver(measure)
    slots.current.forEach((element) => element && observer.observe(element))
    if (viewport.current) observer.observe(viewport.current)
    return () => observer.disconnect()
  }, [active, step])

  // Rueda / trackpad horizontal. Listener nativo no pasivo: hay que poder cancelar el gesto de
  // "atrás/adelante" del navegador; el scroll vertical (deltaY dominante) pasa de largo.
  useEffect(() => {
    const element = viewport.current
    if (!element) return
    const wheel = { accumulated: 0, last: 0, locked: false }

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      const now = performance.now()
      if (now - wheel.last > SILENCIO_RUEDA_MS) {
        wheel.accumulated = 0
        wheel.locked = false
      }
      wheel.last = now
      if (wheel.locked) return
      wheel.accumulated += event.deltaX
      if (Math.abs(wheel.accumulated) >= UMBRAL_RUEDA_PX) {
        goTo(activeRef.current + Math.sign(wheel.accumulated))
        wheel.accumulated = 0
        wheel.locked = true
      }
    }

    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [goTo])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    const keys: Record<string, number> = {
      ArrowLeft: activeRef.current - 1,
      ArrowRight: activeRef.current + 1,
      Home: 0,
      End: total - 1,
    }
    const target = keys[event.key]
    if (target === undefined) return
    event.preventDefault()
    goTo(target)
  }

  // ── Arrastre con Pointer Events ────────────────────────────────────────
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const g = gesture.current
    g.pressed = true
    g.moved = false
    g.suppressClick = false
    g.pointerId = event.pointerId
    g.startX = event.clientX
    g.startPosition = position.get()
    g.startIndex = activeRef.current
    g.samples = [{ time: performance.now(), x: event.clientX }]
    position.jump(g.startPosition) // corta un spring en curso
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    if (!g.pressed) return
    const delta = event.clientX - g.startX

    // La captura se activa recién cuando el gesto es un arrastre (no en el pointerdown): capturar
    // antes rompe el click de los enlaces internos, porque el navegador redirige también el "click".
    if (!g.moved && Math.abs(delta) > UMBRAL_CLICK_PX) {
      g.moved = true
      setDragging(true)
      try {
        event.currentTarget.setPointerCapture(g.pointerId)
      } catch {
        // Algunos navegadores rechazan capturar punteros sintéticos o inactivos.
      }
    }
    if (!g.moved) return

    const now = performance.now()
    g.samples.push({ time: now, x: event.clientX })
    while (g.samples.length > 2 && now - (g.samples[0]?.time ?? now) > VENTANA_VELOCIDAD_MS) {
      g.samples.shift()
    }

    const raw = g.startPosition - delta / step.get()
    const last = total - 1
    const resisted = raw < 0 ? raw * RESISTENCIA_BORDE : raw > last ? last + (raw - last) * RESISTENCIA_BORDE : raw
    position.jump(resisted)
  }

  const finishGesture = () => {
    const g = gesture.current
    if (!g.pressed) return
    g.pressed = false
    if (!g.moved) return

    const first = g.samples[0]
    const lastSample = g.samples[g.samples.length - 1]
    // Mínimo de un cuadro (16 ms): con menos, un gesto sintético o de un solo evento daría velocidad infinita.
    const elapsed = first && lastSample ? Math.max((lastSample.time - first.time) / 1000, 0.016) : 0
    const velocity = first && lastSample ? (lastSample.x - first.x) / elapsed : 0 // px/s
    const projected = position.get() - (velocity / step.get()) * PROYECCION_INERCIA_S
    const travel = projected - g.startIndex
    const steps =
      Math.abs(travel) >= UMBRAL_ARRASTRE_RATIO
        ? Math.min(Math.max(1, Math.round(Math.abs(travel))), MAX_SLIDES_POR_GESTO)
        : 0

    g.suppressClick = true
    window.setTimeout(() => {
      g.suppressClick = false
    }, 0)
    setDragging(false)
    goTo(g.startIndex + Math.sign(travel) * steps)
  }

  const handlePointerLeave = () => {
    // Sin captura (todavía no era un arrastre) salir del viewport cancela el gesto.
    if (gesture.current.pressed && !gesture.current.moved) gesture.current.pressed = false
  }

  const current = projects[active]
  const currentTitle = current ? (text(current.slug)?.title ?? current.slug) : ''
  const counter = `${String(active + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={t('projects.carouselLabel')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="project-carousel rounded-lg"
    >
      <div
        ref={viewport}
        className="project-carousel__viewport"
        data-dragging={dragging || undefined}
        style={{ height: viewportHeight ?? undefined }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishGesture}
        onPointerCancel={finishGesture}
        onPointerLeave={handlePointerLeave}
        onClickCapture={(event) => {
          if (!gesture.current.suppressClick) return
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        {projects.map((project, index) => {
          const distance = Math.abs(index - active)
          return (
            <Slot
              key={project.slug}
              index={index}
              position={position}
              step={step}
              active={index === active}
              rendered={distance <= RADIO_RENDER}
              clickable={distance <= RADIO_CLICK}
              label={t('projects.slideLabel', { n: index + 1, total })}
              slotRef={(element) => {
                slots.current[index] = element
              }}
              onSelect={() => {
                if (index !== activeRef.current) goTo(index)
              }}
            >
              <ProjectCard
                project={project}
                sizes="(min-width: 640px) 520px, 80vw"
              />
            </Slot>
          )
        })}
      </div>

      <div className="project-carousel__controls">
        <p aria-hidden className="font-mono text-small tracking-[0.12em] text-muted">
          <span className="text-strong">{counter.slice(0, 2)}</span>
          {counter.slice(2)}
        </p>

        <div role="group" aria-label={t('projects.pagination')} className="project-carousel__dots">
          {projects.map((project, index) => (
            <button
              key={project.slug}
              type="button"
              onClick={() => goTo(index)}
              aria-label={t('projects.goTo', { n: index + 1, title: text(project.slug)?.title ?? project.slug })}
              aria-current={index === active}
              className="project-carousel__dot"
            />
          ))}
        </div>

        <div className="project-carousel__arrows">
          <ArrowButton
            label={t('projects.previous')}
            disabled={active === 0}
            onClick={() => goTo(active - 1)}
          >
            <ArrowLeft size={20} aria-hidden />
          </ArrowButton>
          <ArrowButton
            label={t('projects.next')}
            disabled={active === total - 1}
            onClick={() => goTo(active + 1)}
          >
            <ArrowRight size={20} aria-hidden />
          </ArrowButton>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" role="status">
        {t('projects.status', { n: active + 1, total, title: currentTitle })}
      </p>
    </div>
  )
}

/** `aria-disabled` en vez de `disabled`: si el foco estaba en la flecha, no se pierde al llegar al borde. */
function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) onClick()
      }}
      className="project-carousel__arrow"
    >
      {children}
    </button>
  )
}
