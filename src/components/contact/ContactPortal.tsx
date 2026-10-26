import { MessageCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { site } from '../../config/site'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cn } from '../../lib/cn'
import { createParticleField, hexToRgb } from './particleField'
import './ContactPortal.css'

// ── Parámetros de tuning ────────────────────────────────────────────────
/** Ángulos por palabra (mismo orden que las palabras). Se evita el tramo cercano a -90° (arriba). */
const WORD_ANGLES_DEG: readonly number[] = [-150, -30, 30, 90, 150]

const PORTAL_CONFIG = {
  attractionRadius: 380,
  cursorSmoothing: 0.1,
  openRiseEase: 0.14,
  openFallEase: 0.05,
  proximityEase: 0.12,
  ambientBreath: 0.07,
  magneticStrength: 0.12,
  magneticMax: 10,
  magneticEase: 0.18,
  clickTransitionDuration: 480,
  tapFadeDelay: 650,
  openLabelThreshold: 0.55,
  wordPullPx: 9,
  /** Estado estático con movimiento reducido. */
  staticLevel: 0.12,
  /** Si por algún motivo el observer no dispara, el contenido no queda oculto indefinidamente. */
  enteredFallbackMs: 2500,
} as const

/** Partículas por tipo de dispositivo; un equipo modesto recibe menos. */
const PARTICLES = { desktop: 28, coarse: 12, lowPowerFactor: 0.6 } as const
const LINES = { desktop: 12, coarse: 7 } as const
const WORDS_COARSE = 3

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** Atenuación suave (smoothstep): fuerte cerca del portal, nula en el borde del radio. */
function falloff(dist: number, radius: number) {
  if (dist >= radius) return 0
  const u = 1 - dist / radius
  return u * u * (3 - 2 * u)
}

function buildLineData(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const jitter = i % 3 === 0 ? 7 : i % 3 === 1 ? -5 : 2
    return {
      angle: ((360 / count) * i + jitter) * (Math.PI / 180),
      outerR: 41 + (i % 4) * 2,
      innerR: 32 + (i % 3) * 1.5,
      baseOpacity: 0.1 + (i % 5) * 0.02,
    }
  })
}

function buildWordData(words: readonly string[]) {
  const radius = 45
  return words.map((text, i) => {
    const angle = (WORD_ANGLES_DEG[i % WORD_ANGLES_DEG.length] ?? 0) * (Math.PI / 180)
    return {
      text,
      leftPct: 50 + Math.cos(angle) * radius,
      topPct: 50 + Math.sin(angle) * radius,
      angle,
      pullFactor: 0.6 + (i % 3) * 0.15,
      tiltSign: i % 2 === 0 ? 1 : -1,
      baseOpacity: 0.22 + (i % 3) * 0.04,
    }
  })
}

/** Equipos con pocos núcleos o poca memoria: se reduce el número de partículas. */
function isLowPower() {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4
}

/**
 * Portal animado de contacto: líneas de energía, palabras flotantes, partículas, halo y anillos
 * que reaccionan a la cercanía del puntero y se abren sobre el botón de WhatsApp. Un único bucle
 * `requestAnimationFrame` (pausado fuera de pantalla y con la pestaña oculta) actualiza todo.
 * Los colores salen de los tokens del tema; con movimiento reducido queda una versión estática
 * con el mismo botón.
 */
export function ContactPortal() {
  const { t } = useTranslation('home')
  const reduced = useReducedMotion()
  const coarse = useMediaQuery('(pointer: coarse)')

  const [isClicking, setIsClicking] = useState(false)
  const [clickWave, setClickWave] = useState(0)
  const [entered, setEntered] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const buttonLabelRef = useRef<HTMLSpanElement>(null)
  const lineRefs = useRef<(SVGLineElement | null)[]>([])
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])

  const allWords = t('contact.words', { returnObjects: true }) as unknown as string[]
  const words = useMemo(() => (coarse ? allWords.slice(0, WORDS_COARSE) : allWords), [coarse, allWords])
  const lineData = useMemo(() => buildLineData(coarse ? LINES.coarse : LINES.desktop), [coarse])
  const wordData = useMemo(() => buildWordData(words), [words])

  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const portal = portalRef.current
    const canvas = canvasRef.current
    const button = buttonRef.current
    if (!root || !stage || !portal || !canvas) return

    const baseCount = coarse ? PARTICLES.coarse : PARTICLES.desktop
    const field = createParticleField(canvas, isLowPower() ? Math.round(baseCount * PARTICLES.lowPowerFactor) : baseCount)
    const readColor = () => field.setColor(hexToRgb(getComputedStyle(root).getPropertyValue('--accent-text')))
    readColor()

    const pointer = { x: 0, y: 0, hasPointer: false }
    const geometry = { centerX: 0, centerY: 0, portalRadius: 60 }
    const smoothed = { x: 0, y: 0 }
    const openState = { value: 0 }
    const proximityState = { value: 0 }
    const magnetic = { x: 0, y: 0 }
    let wasOpenLabel = false
    let rafId: number | null = null
    let visible = true
    let tapFadeTimeout: number | undefined

    const measure = () => {
      const stageRect = stage.getBoundingClientRect()
      const portalRect = portal.getBoundingClientRect()
      geometry.centerX = portalRect.left - stageRect.left + portalRect.width / 2
      geometry.centerY = portalRect.top - stageRect.top + portalRect.height / 2
      geometry.portalRadius = portalRect.width / 2
      if (!pointer.hasPointer) {
        smoothed.x = geometry.centerX
        smoothed.y = geometry.centerY
      }
      field.resize(Math.max(stageRect.width, 1), Math.max(stageRect.height, 1))
      if (reduced) field.draw(performance.now(), { proximity: 0, open: 0, animate: false })
    }

    const setPointer = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.hasPointer = true
    }
    const handleMove = (event: PointerEvent) => setPointer(event)
    const handleLeave = () => {
      pointer.hasPointer = false
    }
    // Táctil: tocar el escenario abre el portal un instante; el botón sigue siendo un enlace directo.
    const handleTap = (event: PointerEvent) => {
      setPointer(event)
      window.clearTimeout(tapFadeTimeout)
      tapFadeTimeout = window.setTimeout(() => {
        pointer.hasPointer = false
      }, PORTAL_CONFIG.tapFadeDelay)
    }

    if (!reduced) {
      if (coarse) {
        stage.addEventListener('pointerdown', handleTap)
      } else {
        stage.addEventListener('pointermove', handleMove)
        stage.addEventListener('pointerleave', handleLeave)
      }
    }

    const tick = (now: number) => {
      // Objetivo del cursor: posición real si hay puntero activo, si no el centro (reposo).
      const idle = !pointer.hasPointer
      const targetX = idle ? geometry.centerX : pointer.x
      const targetY = idle ? geometry.centerY : pointer.y

      smoothed.x += (targetX - smoothed.x) * PORTAL_CONFIG.cursorSmoothing
      smoothed.y += (targetY - smoothed.y) * PORTAL_CONFIG.cursorSmoothing

      const dx = smoothed.x - geometry.centerX
      const dy = smoothed.y - geometry.centerY
      const dist = Math.hypot(dx, dy)

      const rawProximity = idle ? 0 : falloff(dist, PORTAL_CONFIG.attractionRadius)
      const isOver = !idle && dist <= geometry.portalRadius * 1.1

      // Respiración ambiental: mantiene el portal "vivo" incluso sin interacción.
      const ambient = PORTAL_CONFIG.ambientBreath + Math.sin(now * 0.0007) * PORTAL_CONFIG.ambientBreath * 0.5
      const openTarget = isOver ? 1 : Math.max(rawProximity * 0.4, ambient * 0.3)
      const proximityTarget = Math.max(rawProximity, ambient)

      const openEase = openTarget > openState.value ? PORTAL_CONFIG.openRiseEase : PORTAL_CONFIG.openFallEase
      openState.value += (openTarget - openState.value) * openEase
      proximityState.value += (proximityTarget - proximityState.value) * PORTAL_CONFIG.proximityEase

      root.style.setProperty('--cp-open', openState.value.toFixed(3))
      root.style.setProperty('--cp-proximity', proximityState.value.toFixed(3))

      const showOpenLabel = openState.value > PORTAL_CONFIG.openLabelThreshold
      if (showOpenLabel !== wasOpenLabel) {
        wasOpenLabel = showOpenLabel
        if (button) button.dataset.state = showOpenLabel ? 'open' : 'idle'
      }

      if (button) {
        const limit = PORTAL_CONFIG.magneticMax
        const targetBx = isOver ? clamp(dx * PORTAL_CONFIG.magneticStrength, -limit, limit) : 0
        const targetBy = isOver ? clamp(dy * PORTAL_CONFIG.magneticStrength, -limit, limit) : 0
        magnetic.x += (targetBx - magnetic.x) * PORTAL_CONFIG.magneticEase
        magnetic.y += (targetBy - magnetic.y) * PORTAL_CONFIG.magneticEase
        button.style.transform = `translate(${magnetic.x.toFixed(2)}px, ${magnetic.y.toFixed(2)}px)`
        const label = buttonLabelRef.current
        if (label) label.style.transform = `translate(${(magnetic.x * 0.4).toFixed(2)}px, ${(magnetic.y * 0.4).toFixed(2)}px)`
      }

      const converge = proximityState.value * 0.5 + openState.value * 0.35
      lineRefs.current.forEach((line, i) => {
        const base = lineData[i]
        if (!line || !base) return
        const innerR = base.innerR - converge * 13
        const outerR = base.outerR + converge * 5
        line.setAttribute('x1', (50 + Math.cos(base.angle) * outerR).toFixed(2))
        line.setAttribute('y1', (50 + Math.sin(base.angle) * outerR).toFixed(2))
        line.setAttribute('x2', (50 + Math.cos(base.angle) * innerR).toFixed(2))
        line.setAttribute('y2', (50 + Math.sin(base.angle) * innerR).toFixed(2))
        line.style.opacity = (base.baseOpacity + converge * 0.5).toFixed(2)
      })

      wordRefs.current.forEach((word, i) => {
        const base = wordData[i]
        if (!word || !base) return
        // Reacción leve: desplazamiento acotado (~8-12 px máx.), muy por debajo de partículas y líneas.
        const pull = Math.min(proximityState.value * base.pullFactor * (0.5 + openState.value * 0.7), 1)
        const wx = -Math.cos(base.angle) * pull * PORTAL_CONFIG.wordPullPx
        const wy = -Math.sin(base.angle) * pull * PORTAL_CONFIG.wordPullPx
        word.style.transform = `translate(calc(-50% + ${wx.toFixed(2)}px), calc(-50% + ${wy.toFixed(2)}px)) rotate(${(pull * base.tiltSign * 4).toFixed(2)}deg)`
        word.style.opacity = (base.baseOpacity * (1 - pull * 0.3)).toFixed(2)
      })

      field.draw(now, { proximity: proximityState.value, open: openState.value, animate: true })
      rafId = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (reduced || rafId !== null) return
      rafId = requestAnimationFrame(tick)
    }
    const stopLoop = () => {
      if (rafId === null) return
      cancelAnimationFrame(rafId)
      rafId = null
    }

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(stage)
    measure()

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true
        if (visible) {
          setEntered(true)
          if (!document.hidden) startLoop()
        } else {
          stopLoop()
        }
      },
      { threshold: 0.2 },
    )
    intersectionObserver.observe(root)
    const enteredFallback = window.setTimeout(() => setEntered(true), PORTAL_CONFIG.enteredFallbackMs)

    const handleVisibility = () => {
      if (document.hidden) stopLoop()
      else if (visible) startLoop()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // El color de las partículas sale de `--accent-text`: se relee al cambiar de tema.
    const themeObserver = new MutationObserver(() => {
      readColor()
      if (reduced) field.draw(performance.now(), { proximity: 0, open: 0, animate: false })
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    if (reduced) {
      root.style.setProperty('--cp-open', String(PORTAL_CONFIG.staticLevel))
      root.style.setProperty('--cp-proximity', String(PORTAL_CONFIG.staticLevel))
    }

    return () => {
      stopLoop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      themeObserver.disconnect()
      window.clearTimeout(enteredFallback)
      window.clearTimeout(tapFadeTimeout)
      document.removeEventListener('visibilitychange', handleVisibility)
      stage.removeEventListener('pointerdown', handleTap)
      stage.removeEventListener('pointermove', handleMove)
      stage.removeEventListener('pointerleave', handleLeave)
    }
  }, [coarse, reduced, lineData, wordData])

  const handlePortalClick = () => {
    // Sin `preventDefault`: el <a target="_blank"> navega de forma nativa dentro del mismo gesto,
    // así WhatsApp nunca depende de un `window.open` demorado que el navegador pueda bloquear.
    // La animación corre en esta pestaña mientras WhatsApp se abre en la nueva.
    setIsClicking(true)
    setClickWave((n) => n + 1)
    window.setTimeout(() => setIsClicking(false), PORTAL_CONFIG.clickTransitionDuration)
  }

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={t('contact.portalLabel')}
      data-reduced={reduced || undefined}
      className={cn('contact-portal', (entered || reduced) && 'contact-portal--entered', isClicking && 'contact-portal--clicking')}
    >
      <div className="contact-portal__field" aria-hidden />

      <div className="contact-portal__stage" ref={stageRef}>
        <svg className="contact-portal__lines" viewBox="0 0 100 100" aria-hidden focusable="false">
          {lineData.map((base, i) => (
            <line
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el
              }}
              x1={50 + Math.cos(base.angle) * base.outerR}
              y1={50 + Math.sin(base.angle) * base.outerR}
              x2={50 + Math.cos(base.angle) * base.innerR}
              y2={50 + Math.sin(base.angle) * base.innerR}
              style={{ opacity: base.baseOpacity }}
            />
          ))}
        </svg>

        <div className="contact-portal__words" aria-hidden>
          {wordData.map((word, i) => (
            <span
              key={word.text}
              ref={(el) => {
                wordRefs.current[i] = el
              }}
              className="contact-portal__word"
              style={{ left: `${word.leftPct}%`, top: `${word.topPct}%`, opacity: word.baseOpacity }}
            >
              {word.text}
            </span>
          ))}
        </div>

        <div className="contact-portal__particles" aria-hidden>
          <canvas ref={canvasRef} />
        </div>

        <div className="contact-portal__portal" ref={portalRef}>
          <div className="contact-portal__halo" />
          <div className="contact-portal__ring contact-portal__ring--outer" />
          <div className="contact-portal__ring contact-portal__ring--inner" />
          <div className="contact-portal__wave" key={clickWave} />

          <div className="contact-portal__core">
            <a
              ref={buttonRef}
              href={site.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="contact-portal__button"
              data-state="idle"
              onClick={handlePortalClick}
              aria-label={t('contact.whatsappAria')}
            >
              <span className="contact-portal__button-label" ref={buttonLabelRef}>
                <span className="contact-portal__button-text contact-portal__button-text--idle">
                  {t('contact.whatsappIdle')}
                </span>
                <span className="contact-portal__button-text contact-portal__button-text--open">
                  {t('contact.whatsappOpen')}
                </span>
                <span className="contact-portal__button-text contact-portal__button-text--clicking">
                  {t('contact.whatsappOpening')}
                </span>
              </span>
              <MessageCircle className="contact-portal__button-icon" size={18} aria-hidden />
            </a>
          </div>
        </div>
      </div>

      <p className="contact-portal__support">{t('contact.support')}</p>
    </div>
  )
}
