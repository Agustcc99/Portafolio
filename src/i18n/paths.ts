export const locales = ['es', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'es'

const LOCALE_STORAGE_KEY = 'lang'

/** Segmentos de URL localizados (`/es/proyectos` ↔ `/en/projects`). */
export const segments: Record<Locale, { projects: string }> = {
  es: { projects: 'proyectos' },
  en: { projects: 'projects' },
}

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale)
}

export const paths = {
  home: (locale: Locale) => `/${locale}`,
  projects: (locale: Locale) => `/${locale}/${segments[locale].projects}`,
  project: (locale: Locale, slug: string) => `/${locale}/${segments[locale].projects}/${slug}`,
}

/** Idioma elegido a mano (si lo hay) o el del navegador; cualquier otro caso → inglés si no es español. */
export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(saved ?? undefined)) return saved as Locale
  } catch {
    /* almacenamiento bloqueado */
  }
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const lang of languages) {
    const code = lang.toLowerCase().slice(0, 2)
    if (isLocale(code)) return code
  }
  return 'en'
}

export function saveLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    /* almacenamiento bloqueado */
  }
}

/** Ruta equivalente en otro idioma, conservando slug de proyecto, query y hash. */
export function switchLocalePath(pathname: string, to: Locale, search = '', hash = '') {
  const [, from, section, ...rest] = pathname.split('/')
  let target = `/${to}`
  if (isLocale(from) && section === segments[from].projects) {
    target = paths.projects(to)
    if (rest.length) target += `/${rest.join('/')}`
  }
  return `${target}${search}${hash}`
}
