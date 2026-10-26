import { LazyMotion, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MotionPrefsContext } from './motion-prefs-context'

const STORAGE_KEY = 'motion'
const query = '(prefers-reduced-motion: reduce)'

// Las features (layout, gestos) se descargan aparte; mientras tanto `m.*` se ve sin animar.
const loadFeatures = () => import('../lib/motionFeatures').then((mod) => mod.default)

function readSaved(): boolean | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'reduce' ? true : saved === 'full' ? false : null
  } catch {
    return null
  }
}

/**
 * Fuente única de verdad del movimiento reducido: sistema operativo + interruptor manual.
 * Publica `data-motion` en <html> (lo usa el CSS) y configura Motion (`LazyMotion` + `MotionConfig`).
 */
export function MotionPrefsProvider({ children }: { children: ReactNode }) {
  const [manual, setManual] = useState<boolean | null>(readSaved)
  const [system, setSystem] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setSystem(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const reduced = manual ?? system

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduce' : 'full'
  }, [reduced])

  const setReduced = useCallback((next: boolean) => {
    setManual(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'reduce' : 'full')
    } catch {
      /* almacenamiento bloqueado: la preferencia vale solo para esta sesión */
    }
  }, [])

  const toggleReduced = useCallback(() => setReduced(!reduced), [setReduced, reduced])

  const value = useMemo(
    () => ({ reduced, isManual: manual !== null, setReduced, toggleReduced }),
    [reduced, manual, setReduced, toggleReduced],
  )

  return (
    <MotionPrefsContext.Provider value={value}>
      <LazyMotion features={loadFeatures} strict>
        <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>{children}</MotionConfig>
      </LazyMotion>
    </MotionPrefsContext.Provider>
  )
}
