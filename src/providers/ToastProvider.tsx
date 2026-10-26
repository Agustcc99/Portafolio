import { AnimatePresence, m } from 'motion/react'
import { Check, CircleAlert } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { duration, ease } from '../lib/motion'
import { ToastContext, type ToastApi } from './toast-context'

/** Cuánto se queda el aviso en pantalla (ms). */
const TOAST_MS = 2400

/**
 * Avisos breves ("Email copiado"). Un solo aviso a la vez, en una región `status` educada para
 * lectores de pantalla; entra y sale con opacity + un leve desplazamiento (se anula con
 * movimiento reducido vía `MotionConfig`).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; tone: 'success' | 'error' } | null>(null)
  const counter = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = useCallback((message: string, tone: 'success' | 'error' = 'success') => {
    clearTimeout(timer.current)
    counter.current += 1
    setToast({ id: counter.current, message, tone })
    timer.current = setTimeout(() => setToast(null), TOAST_MS)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  const value = useMemo<ToastApi>(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[110] flex justify-center px-4"
      >
        <AnimatePresence>
          {toast && (
            <m.p
              key={toast.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: duration.base, ease: ease.outExpo }}
              className="flex items-center gap-2.5 rounded-pill border border-line-strong bg-surface-1 py-3 pr-5 pl-4 text-small font-medium text-strong shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_12px_32px_rgb(0_0_0/0.25)]"
            >
              {toast.tone === 'error' ? (
                <CircleAlert size={16} aria-hidden className="text-muted" />
              ) : (
                <Check size={16} aria-hidden className="text-accent-text" />
              )}
              {toast.message}
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
