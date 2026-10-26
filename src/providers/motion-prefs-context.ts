import { createContext } from 'react'

export interface MotionPrefsValue {
  /** Movimiento reducido efectivo: preferencia manual si existe, si no la del sistema. */
  reduced: boolean
  /** `true` si la persona eligió a mano (se persiste); `false` si sigue al sistema. */
  isManual: boolean
  setReduced: (reduced: boolean) => void
  toggleReduced: () => void
}

export const MotionPrefsContext = createContext<MotionPrefsValue | null>(null)
