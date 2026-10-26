import { useContext, useEffect } from 'react'
import { SmoothScrollContext } from '../providers/smooth-scroll-context'

export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext)
  if (!ctx) throw new Error('useSmoothScroll debe usarse dentro de <SmoothScrollProvider>')
  return ctx
}

/** Bloquea el scroll de la página mientras `locked` sea `true` (se libera siempre al desmontar). */
export function useScrollLock(locked: boolean) {
  const { lock, unlock } = useSmoothScroll()
  useEffect(() => {
    if (!locked) return
    lock()
    return unlock
  }, [locked, lock, unlock])
}
