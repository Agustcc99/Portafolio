import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { m, type PanInfo } from 'motion/react'
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useScrollLock } from '../../hooks/useSmoothScroll'
import { duration, ease } from '../../lib/motion'
import { ProjectImage } from '../ui/ProjectImage'

/** Desplazamiento (px) o velocidad (px/s) del gesto horizontal que cuenta como swipe. */
const SWIPE_DISTANCE_PX = 60
const SWIPE_VELOCITY = 500

interface LightboxProps {
  open: boolean
  /** Claves de imagen (`consul/c2`). */
  images: readonly string[]
  index: number
  title: string
  onIndexChange: (index: number) => void
  onClose: () => void
}

const circle =
  'inline-flex size-11 cursor-pointer items-center justify-center rounded-pill border border-line-strong bg-surface-1 text-strong transition-colors duration-(--duration-base) hover:border-accent-text hover:text-accent-text aria-disabled:cursor-default aria-disabled:opacity-35 aria-disabled:hover:border-line-strong aria-disabled:hover:text-strong'

/**
 * Visor de capturas sobre un `<dialog>` modal nativo: trampa de foco, `Escape`, fondo inerte y
 * devolución del foco vienen del navegador. Teclado (←/→, Home/End), swipe horizontal y clic
 * fuera de la imagen para cerrar. La entrada/salida es CSS (`.lightbox-dialog`, effects.css).
 */
export function Lightbox({ open, images, index, title, onIndexChange, onClose }: LightboxProps) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  const [direction, setDirection] = useState(1)
  const last = images.length - 1
  const image = images[index]

  useScrollLock(open)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  const go = (target: number) => {
    const next = Math.min(Math.max(target, 0), last)
    if (next === index) return
    setDirection(next > index ? 1 : -1)
    onIndexChange(next)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    const targets: Record<string, number> = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: last }
    const target = targets[event.key]
    if (target === undefined) return
    event.preventDefault()
    go(target)
  }

  const handleDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    if (offset.x < -SWIPE_DISTANCE_PX || velocity.x < -SWIPE_VELOCITY) go(index + 1)
    else if (offset.x > SWIPE_DISTANCE_PX || velocity.x > SWIPE_VELOCITY) go(index - 1)
  }

  // Clic en el fondo (el propio <dialog> o el contenedor de la imagen, no la imagen) cierra.
  const handleBackdropClick = (event: MouseEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={dialog}
      aria-label={t('projects.lightboxLabel', { title })}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      data-lenis-prevent
      className="lightbox-dialog fixed inset-0 m-0 h-svh max-h-none w-full max-w-none overflow-hidden border-0 bg-bg/92 p-0 text-text backdrop-blur-md"
    >
      <div className="flex h-full flex-col px-4 py-4 sm:px-6" onClick={handleBackdropClick}>
        <div className="flex items-center justify-between" onClick={handleBackdropClick}>
          <p className="font-mono text-small tracking-[0.12em] text-muted" aria-live="polite">
            <span className="text-strong">{String(index + 1).padStart(2, '0')}</span> /{' '}
            {String(images.length).padStart(2, '0')}
          </p>
          <button type="button" onClick={onClose} autoFocus aria-label={t('projects.closeLightbox')} className={circle}>
            <X size={20} aria-hidden />
          </button>
        </div>

        <div
          className="flex min-h-0 flex-1 items-center justify-center py-4"
          onClick={handleBackdropClick}
        >
          {open && image && (
            <m.div
              key={image}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              dragSnapToOrigin
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, x: direction * 48 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: duration.slow, ease: ease.outExpo }}
              className="flex max-h-full max-w-full cursor-grab touch-pan-y active:cursor-grabbing"
            >
              <ProjectImage
                image={image}
                alt={t('projects.imageAlt', { n: index + 1, title })}
                sizes="100vw"
                priority
                draggable={false}
                pictureClassName="flex max-h-full max-w-full"
                className="h-auto max-h-[calc(100svh-11rem)] w-auto max-w-full rounded-md border border-line object-contain"
              />
            </m.div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3" onClick={handleBackdropClick}>
          <button
            type="button"
            aria-label={t('projects.previousImage')}
            aria-disabled={index === 0}
            onClick={() => go(index - 1)}
            className={circle}
          >
            <ArrowLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            aria-label={t('projects.nextImage')}
            aria-disabled={index === last}
            onClick={() => go(index + 1)}
            className={circle}
          >
            <ArrowRight size={20} aria-hidden />
          </button>
        </div>
      </div>
    </dialog>
  )
}
