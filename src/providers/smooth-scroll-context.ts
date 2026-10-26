import { createContext } from 'react'

export interface ScrollToOptions {
  /** Salta sin animar (cambios de ruta, hash inicial). */
  immediate?: boolean
  /** Desplazamiento extra en px; por defecto compensa `scroll-padding-top`. */
  offset?: number
}

export interface SmoothScrollApi {
  /** Selector (`#about`), elemento o posición en px. */
  scrollTo: (target: string | HTMLElement | number, options?: ScrollToOptions) => void
  /** Bloquea el scroll de la página (menú móvil, intro). Admite llamadas anidadas. */
  lock: () => void
  unlock: () => void
}

export const SmoothScrollContext = createContext<SmoothScrollApi | null>(null)
