import type { ImgHTMLAttributes } from 'react'
import { getProjectImage } from '../../content/images'
import { cn } from '../../lib/cn'

interface ProjectImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> {
  /** Clave de imagen, ej. `consul/c2`. */
  image: string
  alt: string
  sizes?: string
  /** `true` para la imagen LCP: carga inmediata con prioridad alta. */
  priority?: boolean
}

export function ProjectImage({
  image,
  alt,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority = false,
  className,
  style,
  ...props
}: ProjectImageProps) {
  const info = getProjectImage(image)
  if (!info) return null

  return (
    <picture>
      <source type="image/avif" srcSet={info.srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={info.srcSet('webp')} sizes={sizes} />
      <img
        src={info.src(960)}
        alt={alt}
        width={info.width}
        height={info.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={cn('h-auto w-full', className)}
        style={{ backgroundImage: `url(${info.blur})`, backgroundSize: 'cover', ...style }}
        {...props}
      />
    </picture>
  )
}
