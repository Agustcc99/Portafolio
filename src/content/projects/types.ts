export type ProjectCategory = 'fullstack' | 'backend' | 'frontend'

/** Datos neutros al idioma de un proyecto. Los textos viven en `projects.json` de cada idioma (`i18n/locales`). */
export interface ProjectData {
  slug: string
  /** Posición estable (1 = primero). Define el orden en el carrusel, el índice y "anterior/siguiente". */
  order: number
  /** Aparece en el carrusel del home (máx. 7). */
  featured: boolean
  category: ProjectCategory
  /** Slugs de `content/technologies.ts`. */
  techs: string[]
  /** `null` = el botón se oculta. */
  links: { demo: string | null; code: string | null }
  /** Rutas relativas a `/proyectos/` sin extensión (ej. `consul/c2`); la primera es la portada. */
  images: string[]
  year?: number
}
