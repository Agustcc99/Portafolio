// Fuente única de los metadatos de cada página. La usan `components/seo/Seo.tsx` (cliente) y
// `scripts/prerender-meta.mjs` (build, Node con type stripping): por eso no importa nada salvo
// `i18n/paths.ts` (con extensión `.ts`) y solo usa sintaxis que Node puede borrar sin transformar.
import { locales, paths, type Locale } from '../i18n/paths.ts'

export type PageKind = 'home' | 'projects' | 'project' | 'notFound'

/** Textos de `locales/<idioma>/seo.json`. */
export interface SeoStrings {
  home: { title: string; description: string }
  projects: { title: string; description: string }
  project: { title: string }
  notFound: { title: string; description: string }
  person: { jobTitle: string; description: string }
  og: { alt: string; projectAlt: string }
}

export interface SeoSite {
  url: string
  name: string
  github: string
  linkedin: string | null
}

export interface SeoProject {
  slug: string
  title: string
  short: string
}

export interface SeoPage {
  locale: Locale
  /** Ruta localizada de esta página (sin query). */
  path: string
  title: string
  description: string
  /** Ruta equivalente en cada idioma, para `hreflang`. */
  alternates: Record<Locale, string> | null
  image: string
  imageAlt: string
  type: 'website' | 'article'
  noindex: boolean
}

export type HeadTag =
  | { tag: 'title'; text: string }
  | { tag: 'meta' | 'link'; attrs: Record<string, string> }
  | { tag: 'script'; attrs: Record<string, string>; text: string }

const OG_LOCALE: Record<Locale, string> = { es: 'es_AR', en: 'en_US' }

/** Imágenes Open Graph generadas por `npm run og`: una por idioma y una por proyecto e idioma. */
export function ogImagePath(locale: Locale, slug?: string) {
  return slug ? `/og/${locale}/${slug}.jpg` : `/og/${locale}.jpg`
}

function allLocales<T>(make: (locale: Locale) => T) {
  return Object.fromEntries(locales.map((locale) => [locale, make(locale)])) as Record<Locale, T>
}

/** Arma los metadatos de una página a partir de los textos del idioma (y del proyecto, si corresponde). */
export function pageSeo(
  kind: PageKind,
  locale: Locale,
  strings: SeoStrings,
  project?: SeoProject,
): SeoPage {
  const base = { locale, type: 'website' as const, noindex: false, image: ogImagePath(locale), imageAlt: strings.og.alt }

  switch (kind) {
    case 'home':
      return {
        ...base,
        path: paths.home(locale),
        title: strings.home.title,
        description: strings.home.description,
        alternates: allLocales(paths.home),
      }
    case 'projects':
      return {
        ...base,
        path: paths.projects(locale),
        title: strings.projects.title,
        description: strings.projects.description,
        alternates: allLocales(paths.projects),
      }
    case 'project': {
      if (!project) throw new Error('pageSeo("project") necesita el proyecto')
      return {
        ...base,
        type: 'article',
        path: paths.project(locale, project.slug),
        title: strings.project.title.replace('{{title}}', project.title),
        description: project.short,
        alternates: allLocales((l) => paths.project(l, project.slug)),
        image: ogImagePath(locale, project.slug),
        imageAlt: strings.og.projectAlt.replace('{{title}}', project.title),
      }
    }
    case 'notFound':
      return {
        ...base,
        path: '',
        title: strings.notFound.title,
        description: strings.notFound.description,
        alternates: null,
        noindex: true,
      }
  }
}

export function absoluteUrl(siteUrl: string, path: string) {
  return `${siteUrl.replace(/\/$/, '')}${path}`
}

function personJsonLd(site: SeoSite, locale: Locale, strings: SeoStrings) {
  const sameAs = [site.github.split('?')[0], site.linkedin].filter((url): url is string => Boolean(url))
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${site.url}/#person`,
    name: site.name,
    url: absoluteUrl(site.url, paths.home(locale)),
    jobTitle: strings.person.jobTitle,
    description: strings.person.description,
    image: absoluteUrl(site.url, ogImagePath(locale)),
    knowsAbout: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript'],
    sameAs,
  }
}

function websiteJsonLd(site: SeoSite, locale: Locale, strings: SeoStrings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: absoluteUrl(site.url, paths.home(locale)),
    name: `${site.name} — Portfolio`,
    description: strings.home.description,
    inLanguage: locale,
    author: { '@id': `${site.url}/#person` },
  }
}

function breadcrumbJsonLd(site: SeoSite, locale: Locale, labels: string[], urls: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: labels.map((name, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: absoluteUrl(site.url, urls[i] ?? paths.home(locale)),
    })),
  }
}

/** Datos estructurados: `Person` + `WebSite` en el inicio; migas de pan en el resto de páginas indexables. */
export function pageJsonLd(
  kind: PageKind,
  page: SeoPage,
  site: SeoSite,
  strings: SeoStrings,
  crumbs: { home: string; projects: string },
  project?: SeoProject,
): object[] {
  const { locale } = page
  switch (kind) {
    case 'home':
      return [personJsonLd(site, locale, strings), websiteJsonLd(site, locale, strings)]
    case 'projects':
      return [
        breadcrumbJsonLd(site, locale, [crumbs.home, crumbs.projects], [paths.home(locale), paths.projects(locale)]),
      ]
    case 'project':
      return project
        ? [
            breadcrumbJsonLd(
              site,
              locale,
              [crumbs.home, crumbs.projects, project.title],
              [paths.home(locale), paths.projects(locale), paths.project(locale, project.slug)],
            ),
          ]
        : []
    case 'notFound':
      return []
  }
}

/** Lista plana de etiquetas `<head>`; la misma entra al HTML prerenderizado y al `Seo` de React. */
export function buildHeadTags(page: SeoPage, siteUrl: string, jsonLd: object[]): HeadTag[] {
  const url = (path: string) => absoluteUrl(siteUrl, path)
  const tags: HeadTag[] = [
    { tag: 'title', text: page.title },
    { tag: 'meta', attrs: { name: 'description', content: page.description } },
  ]

  if (page.noindex) {
    tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } })
    return tags
  }

  tags.push({ tag: 'link', attrs: { rel: 'canonical', href: url(page.path) } })

  if (page.alternates) {
    for (const locale of locales) {
      tags.push({
        tag: 'link',
        attrs: { rel: 'alternate', hreflang: locale, href: url(page.alternates[locale]) },
      })
    }
    tags.push({
      tag: 'link',
      attrs: { rel: 'alternate', hreflang: 'x-default', href: url(page.alternates.es) },
    })
  }

  const og: [string, string][] = [
    ['og:type', page.type],
    ['og:site_name', 'Agustín Tacconi'],
    ['og:title', page.title],
    ['og:description', page.description],
    ['og:url', url(page.path)],
    ['og:locale', OG_LOCALE[page.locale]],
    ['og:image', url(page.image)],
    ['og:image:width', '1200'],
    ['og:image:height', '630'],
    ['og:image:alt', page.imageAlt],
  ]
  for (const other of locales) {
    if (other !== page.locale) og.push(['og:locale:alternate', OG_LOCALE[other]])
  }
  for (const [property, content] of og) tags.push({ tag: 'meta', attrs: { property, content } })

  const twitter: [string, string][] = [
    ['twitter:card', 'summary_large_image'],
    ['twitter:title', page.title],
    ['twitter:description', page.description],
    ['twitter:image', url(page.image)],
    ['twitter:image:alt', page.imageAlt],
  ]
  for (const [name, content] of twitter) tags.push({ tag: 'meta', attrs: { name, content } })

  for (const data of jsonLd) {
    // `<` escapado: un valor con `</script>` no puede cerrar la etiqueta.
    const text = JSON.stringify(data).replace(/</g, '\\u003c')
    tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, text })
  }
  return tags
}
