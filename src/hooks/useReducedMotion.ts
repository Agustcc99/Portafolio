import { useContext } from 'react'
import { MotionPrefsContext } from '../providers/motion-prefs-context'

/** Estado global de movimiento reducido (sistema + interruptor manual). Úsalo en vez del de Motion. */
export function useMotionPrefs() {
  const ctx = useContext(MotionPrefsContext)
  if (!ctx) throw new Error('useMotionPrefs debe usarse dentro de <MotionPrefsProvider>')
  return ctx
}

export function useReducedMotion() {
  return useMotionPrefs().reduced
}
