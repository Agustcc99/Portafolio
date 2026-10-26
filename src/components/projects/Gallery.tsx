import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { Reveal, RevealGroup } from '../ui/Reveal'
import { ProjectImage } from '../ui/ProjectImage'

interface GalleryProps {
  /** Claves de imagen de todo el proyecto; la primera es la portada y ya se ve en el hero. */
  images: readonly string[]
  title: string
  /** Recibe el índice absoluto (en `images`) de la captura elegida. */
  onOpen: (index: number) => void
}

/**
 * Capturas del proyecto (menos la portada) en una grilla; cada una abre el `Lightbox`.
 * Si el número de capturas es impar, la primera ocupa el ancho completo para cerrar las filas.
 */
export function Gallery({ images, title, onOpen }: GalleryProps) {
  const { t } = useTranslation()
  const shots = images.slice(1)
  if (shots.length === 0) return null

  return (
    <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2">
      {shots.map((image, i) => {
        const index = i + 1
        return (
          <Reveal as="li" key={image} className={cn(shots.length % 2 === 1 && i === 0 && 'sm:col-span-2')}>
            <button
              type="button"
              onClick={() => onOpen(index)}
              aria-label={t('projects.openImage', { n: index + 1 })}
              aria-haspopup="dialog"
              className="group block w-full cursor-zoom-in overflow-hidden rounded-lg border border-line bg-surface-2 transition-colors duration-(--duration-slow) hover:border-line-strong"
            >
              <ProjectImage
                image={image}
                alt={t('projects.imageAlt', { n: index + 1, title })}
                sizes={shots.length % 2 === 1 && i === 0 ? '(min-width: 1280px) 1184px, 100vw' : '(min-width: 1280px) 580px, (min-width: 640px) 50vw, 100vw'}
                pictureClassName="block"
                className="aspect-[16/10] object-cover object-top transition-transform duration-(--duration-slow) ease-out-expo group-hover:scale-[1.03]"
              />
            </button>
          </Reveal>
        )
      })}
    </RevealGroup>
  )
}
