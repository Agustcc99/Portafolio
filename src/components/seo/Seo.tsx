import { useTranslation } from 'react-i18next'
import { site } from '../../config/site'
import type { Locale } from '../../i18n/paths'
import { buildHeadTags, pageJsonLd, pageSeo, type PageKind, type SeoProject, type SeoStrings } from '../../lib/seo'

interface SeoProps {
  kind: PageKind
  /** Slug, título y resumen del proyecto (solo en `kind="project"`). */
  project?: SeoProject
}

/**
 * Metadatos de la página: título, descripción, canonical, `hreflang`, Open Graph/Twitter y JSON-LD.
 * React 19 los eleva a `<head>`; el HTML prerenderizado (`scripts/prerender-meta.mjs`) trae los mismos
 * para los rastreadores que no ejecutan JS, y `main.tsx` retira los prerenderizados antes de montar.
 */
export function Seo({ kind, project }: SeoProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const strings = i18n.getResourceBundle(locale, 'seo') as SeoStrings

  const page = pageSeo(kind, locale, strings, project)
  const crumbs = { home: t('nav.home'), projects: t('nav.projects') }
  const jsonLd = pageJsonLd(kind, page, site, strings, crumbs, project)

  return buildHeadTags(page, site.url, jsonLd).map((tag, i) => {
    switch (tag.tag) {
      case 'title':
        return <title key={i}>{tag.text}</title>
      case 'meta':
        return <meta key={i} {...tag.attrs} />
      case 'link':
        return <link key={i} {...tag.attrs} />
      case 'script':
        return <script key={i} {...tag.attrs} dangerouslySetInnerHTML={{ __html: tag.text }} />
    }
  })
}
