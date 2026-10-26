import { paths, type Locale } from '../../i18n/paths'

/** Secciones del home. Los ids son neutros (no dependen del idioma) y coinciden con los `id` del DOM. */
export const sectionIds = ['home', 'about', 'projects', 'tech', 'contact'] as const
export type SectionId = (typeof sectionIds)[number]

/** Clave de `common.json` → `nav.<id>`. */
export const navLabelKey = (id: SectionId) => `nav.${id}` as const

/** Enlace a una sección del home desde cualquier página. */
export const sectionHref = (locale: Locale, id: SectionId) =>
  id === 'home' ? paths.home(locale) : `${paths.home(locale)}#${id}`

/** `/es/` y `/es` son la misma página. */
export const normalizePath = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
