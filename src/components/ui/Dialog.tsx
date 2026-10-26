import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { useScrollLock } from '../../hooks/useSmoothScroll'
import { cn } from '../../lib/cn'

interface DialogProps {
  open: boolean
  onClose: () => void
  /** Nombre accesible del diálogo. */
  label: string
  className?: string
  onKeyDown?: (event: KeyboardEvent<HTMLDialogElement>) => void
  children: ReactNode
}

/**
 * Diálogo modal sobre el `<dialog>` nativo: trampa de foco, `Escape`, fondo inerte y devolución
 * del foco al elemento que lo abrió vienen del navegador. Aporta además el bloqueo del scroll de
 * la página (también con Lenis), el cierre al hacer clic en el fondo y el fundido de entrada y
 * salida (`.dialog-fade`, effects.css). Cualquier elemento hijo marcado con `data-dialog-backdrop`
 * cuenta como fondo: un clic directo sobre él cierra.
 */
export function Dialog({ open, onClose, label, className, onKeyDown, children }: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)

  useScrollLock(open)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    const target = event.target as HTMLElement
    if (target === event.currentTarget || target.hasAttribute('data-dialog-backdrop')) onClose()
  }

  return (
    <dialog
      ref={dialog}
      aria-label={label}
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={handleClick}
      data-lenis-prevent
      className={cn(
        'dialog-fade fixed inset-0 m-0 h-svh max-h-none w-full max-w-none overflow-hidden border-0 bg-bg/92 p-0 text-text backdrop-blur-md',
        className,
      )}
    >
      {children}
    </dialog>
  )
}
