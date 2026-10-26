import type common from './locales/es/common.json'
import type home from './locales/es/home.json'
import type projects from './locales/es/projects.json'
import type seo from './locales/es/seo.json'
import type tech from './locales/es/tech.json'

// El español es la fuente de verdad de las claves; `npm run i18n:check` verifica que EN tenga las mismas.
// `items` (indexado por slug, con arreglos) se excluye: lo lee `useContentText` y tiparlo hace explotar a TS (TS2589).
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: { common: typeof common; home: typeof home; projects: Omit<typeof projects, 'items'>; tech: Omit<typeof tech, 'items'>; seo: typeof seo }
  }
}
