import { m } from 'motion/react'
import { createContext, useContext, type ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { groupVariants, reveal, revealVariants, stagger } from '../../lib/motion'

type Tag = 'div' | 'section' | 'article' | 'header' | 'ul' | 'ol' | 'li' | 'p' | 'span'

interface BaseProps {
  as?: Tag
  className?: string
  children: ReactNode
}

/** Los `Reveal` dentro de un `RevealGroup` heredan su disparo y su escalonado. */
const GroupContext = createContext(false)

const viewport = { once: true, margin: reveal.margin } as const

/** Aparición al entrar en pantalla (opacity + y ≤ 40 px, una sola vez). */
export function Reveal({
  as = 'div',
  className,
  children,
  delay = 0,
  y = reveal.y,
}: BaseProps & { delay?: number; y?: number }) {
  const reduced = useReducedMotion()
  const inGroup = useContext(GroupContext)
  const Component = m[as] as typeof m.div
  const variants = revealVariants(y)

  if (inGroup) {
    return (
      <Component className={className} variants={variants}>
        {children}
      </Component>
    )
  }

  return (
    <Component
      className={className}
      variants={variants}
      initial={reduced ? false : 'hidden'}
      whileInView="visible"
      viewport={viewport}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Component>
  )
}

/** Contenedor que escalona la aparición de los `Reveal` hijos (máx. 8 por grupo). */
export function RevealGroup({
  as = 'div',
  className,
  children,
  gap = stagger.base,
  delay = 0,
}: BaseProps & { gap?: number; delay?: number }) {
  const reduced = useReducedMotion()
  const Component = m[as] as typeof m.div

  return (
    <GroupContext.Provider value>
      <Component
        className={className}
        variants={groupVariants(gap, delay)}
        initial={reduced ? false : 'hidden'}
        whileInView="visible"
        viewport={viewport}
      >
        {children}
      </Component>
    </GroupContext.Provider>
  )
}
