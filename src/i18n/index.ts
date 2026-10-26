import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Locale } from './paths'

export const namespaces = ['common', 'home', 'projects', 'tech', 'seo'] as const
export type Namespace = (typeof namespaces)[number]

// Cada idioma es un chunk aparte: solo se descarga el que se usa.
const loaders: Record<Locale, () => Promise<Record<Namespace, object>>> = {
  es: async () => {
    const [common, home, projects, tech, seo] = await Promise.all([
      import('./locales/es/common.json'),
      import('./locales/es/home.json'),
      import('./locales/es/projects.json'),
      import('./locales/es/tech.json'),
      import('./locales/es/seo.json'),
    ])
    return { common, home, projects, tech, seo }
  },
  en: async () => {
    const [common, home, projects, tech, seo] = await Promise.all([
      import('./locales/en/common.json'),
      import('./locales/en/home.json'),
      import('./locales/en/projects.json'),
      import('./locales/en/tech.json'),
      import('./locales/en/seo.json'),
    ])
    return { common, home, projects, tech, seo }
  },
}

const loaded = new Map<Locale, Promise<void>>()

/**
 * `scripts/prerender-meta.mjs` incrusta en el HTML de cada ruta los textos de su idioma
 * (`<script type="application/json" id="i18n-bootstrap">`): leerlos evita pedir los cinco chunks JSON.
 */
function readBootstrap(locale: Locale): Record<Namespace, object> | null {
  const node = document.getElementById('i18n-bootstrap')
  if (!node || node.dataset.locale !== locale) return null
  try {
    return JSON.parse(node.textContent ?? '') as Record<Namespace, object>
  } catch {
    return null
  }
}

function loadLocale(locale: Locale) {
  let pending = loaded.get(locale)
  if (!pending) {
    const bootstrap = readBootstrap(locale)
    pending = (bootstrap ? Promise.resolve(bootstrap) : loaders[locale]()).then((bundles) => {
      for (const ns of namespaces) {
        i18n.addResourceBundle(locale, ns, bundles[ns], true, true)
      }
    })
    loaded.set(locale, pending)
  }
  return pending
}

export async function initI18n(locale: Locale) {
  await i18n.use(initReactI18next).init({
    lng: locale,
    fallbackLng: false,
    ns: [...namespaces],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    resources: {},
  })
  await loadLocale(locale)
  document.documentElement.lang = locale
}

/** Descarga el bundle de un idioma sin activarlo (para cambiarlo después de forma síncrona). */
export function preloadLocale(locale: Locale) {
  return loadLocale(locale)
}

/**
 * Activa un idioma cuyo bundle ya está cargado (`preloadLocale`). Con los recursos en memoria
 * i18next cambia de idioma en el acto, así el cambio de ruta y el de texto caen en el mismo render.
 */
export function activateLanguage(locale: Locale) {
  if (i18n.language !== locale) void i18n.changeLanguage(locale)
  document.documentElement.lang = locale
}

/** Carga el idioma si hace falta, lo activa y actualiza `<html lang>`. */
export async function setLanguage(locale: Locale) {
  await loadLocale(locale)
  if (i18n.language !== locale) await i18n.changeLanguage(locale)
  document.documentElement.lang = locale
}

export default i18n
