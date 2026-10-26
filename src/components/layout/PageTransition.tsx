import { m } from 'motion/react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { duration, ease } from '../../lib/motion'

/**
 * Transición de contenido entre rutas. Donde existe la View Transitions API la hace el navegador
 * (`transitionRoute`); acá queda el respaldo para el resto: entrada con fade y un leve desplazamiento.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  const native = typeof document.startViewTransition === 'function'

  return (
    <m.div
      key={pathname}
      initial={reduced || native ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease: ease.outExpo }}
    >
      {children}
    </m.div>
  )
}
