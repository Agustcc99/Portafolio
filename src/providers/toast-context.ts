import { createContext } from 'react'

export interface ToastApi {
  /** Muestra un aviso breve (`error` cambia el ícono); uno nuevo reemplaza al anterior. */
  show: (message: string, tone?: 'success' | 'error') => void
}

export const ToastContext = createContext<ToastApi | null>(null)
