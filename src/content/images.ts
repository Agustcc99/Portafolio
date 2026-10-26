import manifest from './projects/images.generated.json'

interface ManifestEntry {
  width: number
  height: number
  widths: number[]
  blur: string
}

const entries = manifest as Record<string, ManifestEntry>

export type ImageFormat = 'avif' | 'webp'

export interface ProjectImageInfo {
  width: number
  height: number
  blur: string
  /** Variante más ancha ≤ `maxWidth` (para `<img src>` de respaldo). */
  src: (maxWidth: number) => string
  srcSet: (format: ImageFormat) => string
}

/** `key` es la ruta sin extensión relativa a `/proyectos/` (ej. `consul/c2`). */
export function getProjectImage(key: string): ProjectImageInfo | null {
  const entry = entries[key]
  if (!entry) return null
  const url = (w: number, format: ImageFormat) => `/proyectos/${key}-${w}.${format}`
  return {
    width: entry.width,
    height: entry.height,
    blur: entry.blur,
    src: (maxWidth) => {
      const fit = entry.widths.filter((w) => w <= maxWidth)
      return url(fit[fit.length - 1] ?? entry.widths[0] ?? 0, 'webp')
    },
    srcSet: (format) => entry.widths.map((w) => `${url(w, format)} ${w}w`).join(', '),
  }
}
