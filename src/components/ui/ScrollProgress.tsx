import { m, useScroll, useSpring } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { spring } from '../../lib/motion'

/** Barra de 2 px arriba del todo con `scaleX` ligada al scroll de la página. */
export function ScrollProgress() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { ...spring.ui, restDelta: 0.001 })

  return (
    <m.div
      aria-hidden
      data-vt-name="progress"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-accent-text"
      style={{ scaleX: reduced ? scrollYProgress : smooth }}
    />
  )
}
