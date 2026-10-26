import { createContext } from 'react'

export type Theme = 'light' | 'dark'

/** Punto de la pantalla (px) desde el que se abre el revelado circular. */
export interface ThemeOrigin {
  x: number
  y: number
}

export interface ThemeContextValue {
  theme: Theme
  /** `true` si el usuario eligió el tema a mano (se persiste); `false` si sigue al sistema. */
  isManual: boolean
  setTheme: (theme: Theme, origin?: ThemeOrigin) => void
  toggleTheme: (origin?: ThemeOrigin) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
