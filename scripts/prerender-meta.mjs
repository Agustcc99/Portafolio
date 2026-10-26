// Post-build: genera un HTML por ruta (`dist/<ruta>/index.html`) con los metadatos correctos de cada idioma
// y proyecto (título, descripción, canonical, hreflang, Open Graph/Twitter, JSON-LD) para quienes no
// ejecutan JS (WhatsApp, LinkedIn, Google en su primera pasada). Además escribe `sitemap.xml` y `robots.txt`.
// La lógica de los metadatos vive en `src/lib/seo.ts`, la misma que usa `<Seo>` en el cliente.
// Uso: se ejecuta solo con `npm run build` (SITE_URL sobrescribe el dominio de `config/site.ts`).
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fromRoot, importTs, loadImageIndex, loadLocale, loadProjects, loadSite, locales } from './lib/content.mjs'

const dist = fromRoot('dist')
const { buildHeadTags, pageJsonLd, pageSeo, absoluteUrl } = await importTs('src', 'lib', 'seo.ts')
const { paths } = await importTs('src', 'i18n', 'paths.ts')

const site = await loadSite()
const projects = await loadProjects()
// Saltos de línea normalizados: el hash de la CSP del script inline no puede depender del checkout (CRLF/LF).
const template = (await readFile(path.join(dist, 'index.html'), 'utf8')).replace(/\r\n/g, '\n')

const escapeAttr = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const escapeText = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;')

function render(tag) {
  if (tag.tag === 'title') return `<title data-prerender>${escapeText(tag.text)}</title>`
  const attrs = Object.entries(tag.attrs)
    .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
    .join(' ')
  if (tag.tag === 'script') return `<script ${attrs} data-prerender>${tag.text}</script>`
  return `<${tag.tag} ${attrs} data-prerender>`
}

// ── Precarga de las fuentes críticas (latín cubre tildes y ñ), con los nombres con hash del build ──
const assets = await readdir(path.join(dist, 'assets'))
const css = (
  await Promise.all(assets.filter((f) => f.endsWith('.css')).map((f) => readFile(path.join(dist, 'assets', f), 'utf8')))
).join('\n')
const CRITICAL_FONTS = ['bricolage-grotesque-latin-wght-normal', 'geist-latin-wght-normal', 'instrument-serif-latin-400-italic']
const fontPreloads = CRITICAL_FONTS.map((name) => {
  const match = css.match(new RegExp(`url\\((/assets/${name}-[\\w-]+\\.woff2)\\)`))
  if (!match) throw new Error(`No se encontró la fuente ${name} en el CSS del build`)
  return `<link rel="preload" as="font" type="font/woff2" href="${match[1]}" crossorigin>`
})

// ── Recursos de la ruta: el chunk de su página y la imagen LCP, para que bajen junto al bundle ──────
// (sin esto el navegador los descubre recién cuando React ya montó la página: bundle → chunk → imagen).
const manifest = JSON.parse(await readFile(path.join(dist, '.vite', 'manifest.json'), 'utf8'))
await rm(path.join(dist, '.vite'), { recursive: true, force: true })
const pageChunk = (name) => {
  const entry = Object.values(manifest).find((value) => value.name === name)
  if (!entry) throw new Error(`No se encontró el chunk ${name} en el manifest de Vite`)
  return `<link rel="modulepreload" crossorigin href="/${entry.file}">`
}
const images = await loadImageIndex()
/** `sizes` de la portada LCP en cada página: deben coincidir con los de `ProjectImage` para elegir la misma variante. */
const COVER_SIZES = {
  project: '(min-width: 1280px) 1184px, 100vw',
  projects: '(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw',
}
function coverPreload(project, sizes) {
  const key = project?.images[0]
  const entry = key && images[key]
  if (!entry) return []
  const srcset = entry.widths.map((w) => `/proyectos/${key}-${w}.avif ${w}w`).join(', ')
  return [`<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset}" imagesizes="${sizes}" fetchpriority="high">`]
}
function routeHints(kind, project) {
  if (kind === 'project') return [pageChunk('ProjectDetailPage'), ...coverPreload(project, COVER_SIZES.project)]
  if (kind === 'projects') return [pageChunk('ProjectsIndexPage'), ...coverPreload(projects[0], COVER_SIZES.projects)]
  return []
}

/** HTML base: sin los metadatos por defecto de `index.html` y con las fuentes críticas precargadas. */
const base = template
  .replace(/\s*<title>[\s\S]*?<\/title>/, '')
  .replace(/\s*<meta name="description"[^>]*>/, '')
  .replace('</head>', `    ${fontPreloads.join('\n    ')}\n  </head>`)

const localeData = Object.fromEntries(await Promise.all(locales.map(async (l) => [l, await loadLocale(l)])))

/**
 * Los textos del idioma de la página viajan dentro del HTML: la app los lee de ahí en vez de pedir
 * cinco chunks JSON después de ejecutar el bundle (una cascada de peticiones menos antes del primer pintado).
 */
function i18nBootstrap(locale) {
  const json = JSON.stringify(localeData[locale]).replace(/</g, '\\u003c')
  return `<script type="application/json" id="i18n-bootstrap" data-locale="${locale}" data-prerender>${json}</script>`
}

function build(page, jsonLd, hints) {
  const tags = [...hints, i18nBootstrap(page.locale), ...buildHeadTags(page, site.url, jsonLd).map(render)].join('\n    ')
  return base
    .replace(/<html lang="\w+"/, `<html lang="${page.locale}"`)
    .replace('</head>', `    ${tags}\n  </head>`)
}

const routes = []
for (const locale of locales) {
  const { common, projects: projectTexts, seo } = localeData[locale]
  const crumbs = { home: common.nav.home, projects: common.nav.projects }

  const entries = [{ kind: 'home' }, { kind: 'projects' }]
  for (const project of projects) {
    const text = projectTexts.items[project.slug]
    if (!text) throw new Error(`Falta el texto de "${project.slug}" en ${locale}/projects.json`)
    entries.push({ kind: 'project', project: { slug: project.slug, title: text.title, short: text.short } })
  }

  for (const { kind, project } of entries) {
    const page = pageSeo(kind, locale, seo, project)
    const jsonLd = pageJsonLd(kind, page, site, seo, crumbs, project)
    const file = path.join(dist, page.path, 'index.html')
    await mkdir(path.dirname(file), { recursive: true })
    const detail = project && projects.find((p) => p.slug === project.slug)
    await writeFile(file, build(page, jsonLd, routeHints(kind, detail)))
    routes.push(page)
  }
}

// El HTML raíz (fallback de las rutas desconocidas) también lleva las fuentes precargadas.
await writeFile(path.join(dist, 'index.html'), base)

// ── sitemap.xml (con alternativas por idioma) y robots.txt ───────────────────────────────────────
const lastmod = new Date().toISOString().slice(0, 10)
const urls = routes
  .map((page) => {
    const alternates = locales
      .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(site.url, page.alternates[l])}"/>`)
      .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(site.url, page.alternates.es)}"/>`)
      .join('\n')
    const priority = page.path === paths.home(page.locale) ? '1.0' : '0.8'
    return `  <url>\n    <loc>${absoluteUrl(site.url, page.path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n${alternates}\n  </url>`
  })
  .join('\n')
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
)
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`)

// ── Guardia de la CSP: el script anti-flash de index.html va permitido por hash en vercel.json ───
const inline = template.match(/<script>([\s\S]*?)<\/script>/)
if (inline) {
  const hash = `'sha256-${createHash('sha256').update(inline[1]).digest('base64')}'`
  const vercel = await readFile(fromRoot('vercel.json'), 'utf8')
  if (!vercel.includes(hash)) {
    throw new Error(
      `El script inline de index.html cambió: actualizá en vercel.json (Content-Security-Policy, script-src) el hash por ${hash}`,
    )
  }
}

console.log(`prerender-meta: ${routes.length} páginas, sitemap.xml y robots.txt (${site.url})`)
