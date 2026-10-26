import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'

const STORAGE_KEY = 'theme'
const query = '(prefers-color-scheme: light)'

function readSaved(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  return window.matchMedia(query).matches ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Theme | null>(readSaved)
  const [system, setSystem] = useState<Theme>(systemTheme)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setSystem(mql.matches ? 'light' : 'dark')
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const theme = saved ?? system

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setSaved(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* almacenamiento bloqueado: el tema sigue funcionando en memoria */
    }
  }, [])

  const toggleTheme = useCallback(
    () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    [setTheme, theme],
  )

  const value = useMemo(
    () => ({ theme, isManual: saved !== null, setTheme, toggleTheme }),
    [theme, saved, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
