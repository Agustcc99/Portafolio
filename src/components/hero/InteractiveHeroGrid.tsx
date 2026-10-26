import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './InteractiveHeroGrid.css'

// Parámetros configurables: ajustar acá para modificar intensidad, radio, colores, etc.
const CONFIG = {
  gridSpacingDesktop: 46,
  gridSpacingMobile: 58,

  interactionRadius: 190,
  maxDisplacement: 20,
  waveStrength: 5,
  waveSpeed: 0.006,
  wavePulsePeriod: 1900,

  cursorSmoothingFast: 0.12,
  cursorSmoothingSlow: 0.05,
  restoreStrength: 0.07,
  idleFadeMs: 260,

  /** Opacidad de la cuadrícula base por tema (la tinta es `--text-strong`). */
  gridOpacity: { dark: 0.06, light: 0.08 },
  highlightOpacity: 0.4,

  primaryLightRadius: 360,
  secondaryLightRadius: 300,
  primaryLightAlpha: { dark: 0.16, light: 0.22 },
  secondaryLightAlpha: { dark: 0.1, light: 0.14 },

  mobileWaveAmplitude: 5,
  mobileWaveSpeed: 0.0009,

  maxDevicePixelRatio: 2,
} as const

interface Point {
  ox: number
  oy: number
  x: number
  y: number
  near: number
}

interface Grid {
  points: Point[]
  cols: number
  rows: number
}

interface Vec {
  x: number
  y: number
}

/** Colores ya resueltos (triplete `r, g, b`) a partir de las variables CSS del tema activo. */
interface Palette {
  ink: string
  glow: string
  highlight: string
  gridAlpha: number
  primaryAlpha: number
  secondaryAlpha: number
}

/** Convierte `#rrggbb`, `#rgb` o `rgb(r g b / a)` en `"r, g, b"`. */
function toRgb(value: string, fallback: string) {
  const v = value.trim()
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1]
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
    const n = parseInt(full, 16)
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
  }
  const channels = v.match(/[\d.]+/g)
  if (v.startsWith('rgb') && channels && channels.length >= 3) return channels.slice(0, 3).join(', ')
  return fallback
}

function readPalette(host: Element): Palette {
  const style = getComputedStyle(host)
  const light = document.documentElement.dataset.theme === 'light'
  const mode = light ? 'light' : 'dark'
  return {
    ink: toRgb(style.getPropertyValue('--text-strong'), '245, 245, 247'),
    glow: toRgb(style.getPropertyValue('--accent'), '196, 245, 66'),
    highlight: toRgb(style.getPropertyValue('--accent-text'), '196, 245, 66'),
    gridAlpha: CONFIG.gridOpacity[mode],
    primaryAlpha: CONFIG.primaryLightAlpha[mode],
    secondaryAlpha: CONFIG.secondaryLightAlpha[mode],
  }
}

// Curva de atenuación suave (smoothstep) para que el límite del radio no se note.
function falloff(dist: number, radius: number) {
  if (dist >= radius) return 0
  const u = 1 - dist / radius
  return u * u * (3 - 2 * u)
}

function drawLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rgb: string,
  alpha: number,
) {
  if (alpha <= 0.001) return
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, `rgba(${rgb}, ${alpha})`)
  gradient.addColorStop(1, `rgba(${rgb}, 0)`)
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function applyCursorForces(
  points: Point[],
  cx: number,
  cy: number,
  intensity: number,
  speed: number,
  now: number,
) {
  const radius = CONFIG.interactionRadius
  const speedBoost = 1 + Math.min(speed * 6, 0.6)

  for (const p of points) {
    const dx = p.ox - cx
    const dy = p.oy - cy
    const dist = Math.hypot(dx, dy)

    if (intensity > 0.001 && dist < radius * 1.3) {
      const f = falloff(dist, radius)
      const angle = Math.atan2(dy, dx)
      const wave = Math.sin(dist * 0.045 - now * CONFIG.waveSpeed) * CONFIG.waveStrength
      const push = (f * CONFIG.maxDisplacement * speedBoost + wave * f) * intensity
      const targetX = p.ox + Math.cos(angle) * push
      const targetY = p.oy + Math.sin(angle) * push
      p.x += (targetX - p.x) * 0.2
      p.y += (targetY - p.y) * 0.2
      p.near = f * intensity
    } else {
      p.x += (p.ox - p.x) * CONFIG.restoreStrength
      p.y += (p.oy - p.y) * CONFIG.restoreStrength
      p.near = 0
    }
  }
}

function applyAmbientWave(points: Point[], now: number) {
  const scrollFactor = (window.scrollY || 0) * 0.0015
  const phase = now * CONFIG.mobileWaveSpeed + scrollFactor
  const amp = CONFIG.mobileWaveAmplitude

  for (const p of points) {
    const localPhase = phase + p.ox * 0.01 + p.oy * 0.01
    const targetX = p.ox + Math.cos(localPhase) * amp * 0.4
    const targetY = p.oy + Math.sin(localPhase) * amp
    p.x += (targetX - p.x) * 0.05
    p.y += (targetY - p.y) * 0.05
  }
}

function buildGrid(width: number, height: number, spacing: number): Grid {
  const cols = Math.ceil(width / spacing) + 1
  const rows = Math.ceil(height / spacing) + 1
  const points: Point[] = new Array(cols * rows)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ox = c * spacing
      const oy = r * spacing
      points[r * cols + c] = { ox, oy, x: ox, y: oy, near: 0 }
    }
  }

  return { points, cols, rows }
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grid: Grid,
  palette: Palette,
  fast: Vec,
  slow: Vec,
  intensity: number,
  animated = true,
) {
  ctx.clearRect(0, 0, width, height)

  // Luces reactivas: se mezclan aditivamente detrás de la cuadrícula.
  ctx.globalCompositeOperation = 'lighter'
  drawLight(
    ctx,
    fast.x,
    fast.y,
    CONFIG.primaryLightRadius,
    palette.glow,
    palette.primaryAlpha * (0.4 + intensity * 0.6),
  )
  drawLight(
    ctx,
    slow.x,
    slow.y,
    CONFIG.secondaryLightRadius,
    palette.glow,
    palette.secondaryAlpha * (0.4 + intensity * 0.6),
  )
  ctx.globalCompositeOperation = 'source-over'

  const { points, cols, rows } = grid

  // Cuadrícula base en un único trazo (barato incluso con varios cientos de puntos).
  ctx.strokeStyle = `rgba(${palette.ink}, ${palette.gridAlpha})`
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p = points[r * cols + c]
      if (!p) continue
      if (c === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
  }
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const p = points[r * cols + c]
      if (!p) continue
      if (r === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
  }
  ctx.stroke()

  if (intensity <= 0.02) return

  // Resalte local: solo se dibujan los puntos cercanos al cursor (p.near > 0).
  ctx.lineWidth = 1.3
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    if (!p || p.near <= 0.03) continue

    ctx.strokeStyle = `rgba(${palette.highlight}, ${p.near * CONFIG.highlightOpacity})`
    const col = i % cols

    const right = points[i + 1]
    if (col < cols - 1 && right) {
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(right.x, right.y)
      ctx.stroke()
    }

    const down = points[i + cols]
    if (down) {
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(down.x, down.y)
      ctx.stroke()
    }
  }

  // Onda circular sutil que se propaga desde el cursor (no tiene sentido en el cuadro estático).
  if (!animated) return
  const pulseT = (performance.now() % CONFIG.wavePulsePeriod) / CONFIG.wavePulsePeriod
  ctx.strokeStyle = `rgba(${palette.highlight}, ${(1 - pulseT) * 0.18 * intensity})`
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(fast.x, fast.y, pulseT * CONFIG.interactionRadius * 1.25, 0, Math.PI * 2)
  ctx.stroke()
}

declare global {
  interface Window {
    /** Solo en desarrollo: coste de JS por frame del canvas (ver Fase 5 del plan). */
    __heroGridStats?: { frames: number; totalMs: number; maxMs: number }
  }
}

/**
 * Cuadrícula interactiva de fondo del hero. Ocupa todo el elemento padre (que debe ser
 * `position: relative`) y escucha el puntero en él. Lee sus colores de las variables CSS del tema,
 * se pausa fuera de pantalla o con la pestaña oculta, y con movimiento reducido dibuja un único
 * cuadro estático.
 */
export function InteractiveHeroGrid() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    const host = wrapper?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!wrapper || !canvas || !host || !ctx) return

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    let palette = readPalette(host)

    const state = {
      width: 0,
      height: 0,
      grid: { points: [], cols: 0, rows: 0 } as Grid,
      fast: { x: 0, y: 0 },
      slow: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      lastRaw: { x: 0, y: 0, t: 0 },
      speed: 0,
      intensity: 0,
      hasPointer: false,
      lastMove: 0,
      visible: true,
      rafId: null as number | null,
    }

    function drawStaticFrame() {
      const { width, height, grid } = state
      const fast = { x: width * 0.2, y: height * 0.2 }
      const slow = { x: width * 0.8, y: height * 0.3 }
      drawFrame(ctx!, width, height, grid, palette, fast, slow, 0.35, false)
    }

    function resize() {
      const rect = host!.getBoundingClientRect()
      const width = Math.max(rect.width, 1)
      const height = Math.max(rect.height, 1)
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDevicePixelRatio)

      // El canvas interno crece con el dpr; el contexto se reescala para dibujar en coordenadas CSS.
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      state.width = width
      state.height = height
      const spacing = isCoarsePointer ? CONFIG.gridSpacingMobile : CONFIG.gridSpacingDesktop
      state.grid = buildGrid(width, height, spacing)

      for (const v of [state.fast, state.slow, state.target]) {
        v.x = width / 2
        v.y = height * 0.42
      }

      if (reducedMotion) drawStaticFrame()
    }

    function updatePointerMeta(x: number, y: number) {
      const now = performance.now()
      const dt = Math.max(now - state.lastRaw.t, 1)
      const instSpeed = Math.hypot(x - state.lastRaw.x, y - state.lastRaw.y) / dt
      state.speed = state.speed * 0.5 + instSpeed * 0.5
      state.lastRaw = { x, y, t: now }
      state.target.x = x
      state.target.y = y
      state.lastMove = now
      state.hasPointer = true
    }

    function handlePointerMove(event: PointerEvent) {
      if (isCoarsePointer) return
      const rect = host!.getBoundingClientRect()
      updatePointerMeta(event.clientX - rect.left, event.clientY - rect.top)
    }

    function handlePointerLeave() {
      state.hasPointer = false
      state.lastMove = performance.now() - CONFIG.idleFadeMs
      // Al salir, la iluminación vuelve a una posición ambiental neutra.
      state.target.x = state.width / 2
      state.target.y = state.height * 0.42
    }

    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0]
      if (!touch) return
      const rect = host!.getBoundingClientRect()
      updatePointerMeta(touch.clientX - rect.left, touch.clientY - rect.top)
    }

    function handleTouchEnd() {
      state.hasPointer = false
    }

    function tick() {
      const started = import.meta.env.DEV ? performance.now() : 0
      const now = performance.now()

      // Interpolación del cursor: la luz "rápida" y la "lenta" persiguen el objetivo con distinto retraso.
      state.fast.x += (state.target.x - state.fast.x) * CONFIG.cursorSmoothingFast
      state.fast.y += (state.target.y - state.fast.y) * CONFIG.cursorSmoothingFast
      state.slow.x += (state.target.x - state.slow.x) * CONFIG.cursorSmoothingSlow
      state.slow.y += (state.target.y - state.slow.y) * CONFIG.cursorSmoothingSlow

      const idle = now - state.lastMove > CONFIG.idleFadeMs
      const intensityTarget = state.hasPointer && !idle ? 1 : 0
      const ease = intensityTarget > state.intensity ? 0.15 : 0.03
      state.intensity += (intensityTarget - state.intensity) * ease
      state.speed *= 0.9

      if (isCoarsePointer) {
        applyAmbientWave(state.grid.points, now)
        if (state.hasPointer) {
          applyCursorForces(state.grid.points, state.target.x, state.target.y, 0.7, state.speed, now)
        }
      } else {
        applyCursorForces(state.grid.points, state.fast.x, state.fast.y, state.intensity, state.speed, now)
      }

      drawFrame(ctx!, state.width, state.height, state.grid, palette, state.fast, state.slow, state.intensity)
      state.rafId = requestAnimationFrame(tick)

      if (import.meta.env.DEV) {
        const cost = performance.now() - started
        const stats = (window.__heroGridStats ??= { frames: 0, totalMs: 0, maxMs: 0 })
        stats.frames += 1
        stats.totalMs += cost
        stats.maxMs = Math.max(stats.maxMs, cost)
      }
    }

    function startLoop() {
      if (reducedMotion || state.rafId !== null) return
      state.lastRaw.t = performance.now()
      state.rafId = requestAnimationFrame(tick)
    }

    function stopLoop() {
      if (state.rafId !== null) {
        cancelAnimationFrame(state.rafId)
        state.rafId = null
      }
    }

    if (!reducedMotion) {
      if (isCoarsePointer) {
        host.addEventListener('touchstart', handleTouchMove, { passive: true })
        host.addEventListener('touchmove', handleTouchMove, { passive: true })
        host.addEventListener('touchend', handleTouchEnd, { passive: true })
        host.addEventListener('touchcancel', handleTouchEnd, { passive: true })
      } else {
        host.addEventListener('pointermove', handlePointerMove, { passive: true })
        host.addEventListener('pointerleave', handlePointerLeave)
      }
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        state.visible = entries[0]?.isIntersecting ?? true
        if (state.visible && !document.hidden) startLoop()
        else stopLoop()
      },
      { threshold: 0.05 },
    )
    intersectionObserver.observe(host)

    function handleVisibilityChange() {
      if (document.hidden) stopLoop()
      else if (state.visible) startLoop()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cambio de tema: se vuelven a leer los colores (y se redibuja si no hay animación en curso).
    const themeObserver = new MutationObserver(() => {
      palette = readPalette(host)
      if (reducedMotion) drawStaticFrame()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    if (reducedMotion) drawStaticFrame()
    else startLoop()

    return () => {
      stopLoop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      themeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      host.removeEventListener('pointermove', handlePointerMove)
      host.removeEventListener('pointerleave', handlePointerLeave)
      host.removeEventListener('touchstart', handleTouchMove)
      host.removeEventListener('touchmove', handleTouchMove)
      host.removeEventListener('touchend', handleTouchEnd)
      host.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [reducedMotion])

  return (
    <div className="interactive-hero-grid" ref={wrapperRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
