import { m, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { spring } from '../../lib/motion'
import { cn } from '../../lib/cn'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  /** Desplazamiento máximo en px. */
  strength?: number
  /** Distancia al borde del elemento a la que empieza a atraer, en px. */
  radius?: number
}

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value))

/**
 * Hace que el botón (o enlace) hijo se incline hacia el puntero. Solo CTAs principales y solo
 * con puntero fino; con movimiento reducido o en táctil no hace nada.
 */
export function MagneticButton({
  children,
  className,
  strength = 8,
  radius = 80,
}: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, spring.ui)
  const springY = useSpring(y, spring.ui)

  useEffect(() => {
    const element = ref.current
    if (!element || reduced || !window.matchMedia('(pointer: fine)').matches) return

    let frame = 0
    let pointer = { x: 0, y: 0 }
    let visible = true

    const update = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      const dx = pointer.x - (rect.left + rect.width / 2)
      const dy = pointer.y - (rect.top + rect.height / 2)
      const reach = radius + Math.max(rect.width, rect.height) / 2
      if (Math.hypot(dx, dy) > reach) {
        x.set(0)
        y.set(0)
        return
      }
      x.set(clamp(dx * 0.25, strength))
      y.set(clamp(dy * 0.25, strength))
    }

    const onMove = (event: PointerEvent) => {
      if (!visible || event.pointerType !== 'mouse') return
      pointer = { x: event.clientX, y: event.clientY }
      if (!frame) frame = requestAnimationFrame(update)
    }
    const reset = () => {
      x.set(0)
      y.set(0)
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      if (!visible) reset()
    })
    observer.observe(element)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', reset)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', reset)
      reset()
    }
  }, [reduced, radius, strength, x, y])

  return (
    <m.span ref={ref} className={cn('inline-flex', className)} style={{ x: springX, y: springY }}>
      {children}
    </m.span>
  )
}
