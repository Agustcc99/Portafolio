/**
 * Campo de partículas del portal de contacto. No tiene bucle propio: `ContactPortal` lo dibuja
 * desde su único `requestAnimationFrame` (junto con las líneas y las palabras), así todo se pausa
 * a la vez fuera de pantalla o con la pestaña oculta.
 */

/** Tipado de las constantes de tuning (la lógica se conserva del portal original). */
const RADIO_MIN_RATIO: number = 0.22
const RADIO_MAX_RATIO: number = 0.48
const PORTAL_RADIO_RATIO: number = 0.19
/** Fracción del cambio por cuadro con que cada partícula persigue su objetivo. */
const SUAVIZADO: number = 0.05
const DERIVA_PX: number = 3
const TRAGADA_OPEN_UMBRAL: number = 0.75
const TRAGADA_DISTANCIA_RATIO: number = 0.55
const REAPARECE_MS = { min: 900, extra: 600 } as const

interface Particle {
  ox: number
  oy: number
  x: number
  y: number
  radius: number
  baseOpacity: number
  phase: number
  phaseSpeed: number
  swallowed: boolean
  respawnAt: number
}

export interface ParticleField {
  /** Tamaño CSS del escenario; recrea las partículas. */
  resize: (width: number, height: number) => void
  /** Color como "r, g, b" (se relee al cambiar de tema). */
  setColor: (rgb: string) => void
  /** `animate: false` dibuja un cuadro estático (movimiento reducido). */
  draw: (now: number, state: { proximity: number; open: number; animate: boolean }) => void
}

/** Convierte `#rrggbb` / `#rgb` (los tokens de color) en "r, g, b"; si no puede, un verde neutro. */
export function hexToRgb(hex: string) {
  const value = hex.trim().replace('#', '')
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value
  if (!/^[0-9a-f]{6}$/i.test(full)) return '196, 245, 66'
  const n = parseInt(full, 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

export function createParticleField(canvas: HTMLCanvasElement, count: number): ParticleField {
  const ctx = canvas.getContext('2d')
  const size = { width: 0, height: 0, centerX: 0, centerY: 0, portalRadius: 60 }
  let particles: Particle[] = []
  let color = '196, 245, 66'

  function spawn(): Particle[] {
    const minR = Math.min(size.width, size.height) * RADIO_MIN_RATIO
    const maxR = Math.min(size.width, size.height) * RADIO_MAX_RATIO
    return Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const dist = minR + Math.random() * (maxR - minR)
      const ox = size.centerX + Math.cos(angle) * dist
      const oy = size.centerY + Math.sin(angle) * dist
      return {
        ox,
        oy,
        x: ox,
        y: oy,
        radius: 1 + Math.random() * 1.8,
        baseOpacity: 0.15 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.0003 + Math.random() * 0.0004,
        swallowed: false,
        respawnAt: 0,
      }
    })
  }

  return {
    resize(width, height) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)

      size.width = width
      size.height = height
      size.centerX = width / 2
      size.centerY = height / 2
      size.portalRadius = Math.min(width, height) * PORTAL_RADIO_RATIO
      particles = spawn()
    },

    setColor(rgb) {
      color = rgb
    },

    draw(now, { proximity, open, animate }) {
      if (!ctx) return
      ctx.clearRect(0, 0, size.width, size.height)
      const cx = size.centerX
      const cy = size.centerY

      for (const p of particles) {
        if (p.swallowed) {
          if (now < p.respawnAt) continue
          const angle = Math.random() * Math.PI * 2
          const dist = size.portalRadius * 2.3 + Math.random() * size.portalRadius * 1.4
          p.ox = cx + Math.cos(angle) * dist
          p.oy = cy + Math.sin(angle) * dist
          p.x = p.ox
          p.y = p.oy
          p.swallowed = false
        }

        if (animate) {
          // Deriva ambiental suave (fase determinística, sin aleatoriedad por cuadro).
          p.phase += p.phaseSpeed * 16.7
          const wanderX = Math.cos(p.phase) * DERIVA_PX
          const wanderY = Math.sin(p.phase * 0.8) * DERIVA_PX

          const pull = (proximity * 0.5 + open * 0.9) * 0.06
          const targetX = p.ox + wanderX + (cx - p.ox) * pull
          const targetY = p.oy + wanderY + (cy - p.oy) * pull
          p.x += (targetX - p.x) * SUAVIZADO
          p.y += (targetY - p.y) * SUAVIZADO

          if (open > TRAGADA_OPEN_UMBRAL && Math.hypot(cx - p.x, cy - p.y) < size.portalRadius * TRAGADA_DISTANCIA_RATIO) {
            p.swallowed = true
            p.respawnAt = now + REAPARECE_MS.min + Math.random() * REAPARECE_MS.extra
            continue
          }
        }

        ctx.beginPath()
        ctx.fillStyle = `rgba(${color}, ${(p.baseOpacity * (animate ? 1 : 0.6)).toFixed(3)})`
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    },
  }
}
