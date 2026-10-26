// Lectura de los datos del sitio desde Node (sin pasar por Vite): configuración, proyectos y textos por idioma.
// Node 24 borra los tipos de los `.ts` al importarlos, así que se leen los mismos archivos que usa la app.
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const locales = ['es', 'en']

export const fromRoot = (...parts) => path.join(root, ...parts)
const importTs = (...parts) => import(pathToFileURL(fromRoot(...parts)).href)

export async function loadSite() {
  const { site } = await importTs('src', 'config', 'site.ts')
  return { ...site, url: (process.env.SITE_URL ?? site.url).replace(/\/$/, '') }
}

/** Proyectos ordenados, igual que `content/projects/index.ts`. */
export async function loadProjects() {
  const dir = fromRoot('src', 'content', 'projects')
  const files = (await readdir(dir)).filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'types.ts')
  const modules = await Promise.all(files.map((f) => importTs('src', 'content', 'projects', f)))
  return modules.map((m) => m.default).sort((a, b) => a.order - b.order)
}

export async function loadLocale(locale) {
  const read = async (ns) =>
    JSON.parse(await readFile(fromRoot('src', 'i18n', 'locales', locale, `${ns}.json`), 'utf8'))
  const [common, home, projects, tech, seo] = await Promise.all(['common', 'home', 'projects', 'tech', 'seo'].map(read))
  return { common, home, projects, tech, seo }
}

export async function loadImageIndex() {
  return JSON.parse(await readFile(fromRoot('src', 'content', 'projects', 'images.generated.json'), 'utf8'))
}

export { importTs, pathToFileURL }
