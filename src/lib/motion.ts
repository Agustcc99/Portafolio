import type { Transition, Variants } from 'motion/react'

/** Tokens de movimiento (plan §3.4). Espejo en CSS: `--duration-*` y `--ease-*` de styles/index.css. */
export const duration = { fast: 0.15, base: 0.3, slow: 0.6, hero: 1 } as const

export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const

export const spring = {
  ui: { type: 'spring', stiffness: 260, damping: 28, mass: 0.9 },
  soft: { type: 'spring', stiffness: 140, damping: 22 },
} as const satisfies Record<string, Transition>

/** Pausa entre hijos de un grupo (máx. 8 elementos por grupo). */
export const stagger = { base: 0.07, max: 8 } as const

export const reveal = {
  /** Desplazamiento inicial en px; nunca más de 40. */
  y: 24,
  maxY: 40,
  /** Se dispara cuando el elemento entra un 10 % por encima del borde inferior. */
  margin: '0px 0px -10% 0px',
} as const

/** Variantes de aparición (opacity + y). `y` se acota a `reveal.maxY`. */
export function revealVariants(y: number = reveal.y): Variants {
  return {
    hidden: { opacity: 0, y: Math.min(y, reveal.maxY) },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, ease: ease.outExpo },
    },
  }
}

/** Variantes del contenedor de un grupo: escalona la aparición de los hijos. */
export function groupVariants(gap: number = stagger.base, delay = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: gap, delayChildren: delay } },
  }
}

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease: ease.inOut } },
}
