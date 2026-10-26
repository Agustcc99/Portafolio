import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { Seo } from '../components/seo/Seo'
import { ProjectFilters, type FilterOption } from '../components/projects/ProjectFilters'
import { ProjectGrid } from '../components/projects/ProjectGrid'
import { Container } from '../components/ui/Container'
import { Reveal } from '../components/ui/Reveal'
import { SplitHeading } from '../components/ui/SplitHeading'
import { projects } from '../content/projects'

/** Cuenta cuántos proyectos hay por valor, de mayor a menor (desempate por orden de aparición). */
function tally(values: string[]): FilterOption[] {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count)
}

/**
 * Índice de proyectos con filtros por categoría y tecnología. El estado vive en la URL
 * (`?cat=fullstack&tech=react`), así que se puede compartir y sobrevive al cambio de idioma.
 */
export default function ProjectsIndexPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()

  const categories = useMemo(() => tally(projects.map((p) => p.category)), [])
  const techs = useMemo(() => tally(projects.flatMap((p) => p.techs)), [])

  // Valores desconocidos en la URL se ignoran en vez de dejar la grilla vacía.
  const rawCategory = params.get('cat')
  const rawTech = params.get('tech')
  const category = categories.some((c) => c.id === rawCategory) ? rawCategory : null
  const tech = techs.some((o) => o.id === rawTech) ? rawTech : null

  const visible = useMemo(
    () =>
      projects.filter(
        (p) => (category === null || p.category === category) && (tech === null || p.techs.includes(tech)),
      ),
    [category, tech],
  )

  const update = (key: 'cat' | 'tech', value: string | null) => {
    const next = new URLSearchParams(params)
    if (value === null) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const accent = { em: <em className="font-serif font-normal text-accent-text" /> }

  return (
    <Container as="main" className="pt-[clamp(8rem,16vw,12rem)] pb-[clamp(5rem,12vw,10rem)]">
      <Seo kind="projects" />

      <header className="mb-10 max-w-[56rem] md:mb-14">
        <Reveal
          as="p"
          className="mb-5 flex items-center gap-3 font-mono text-label uppercase tracking-[0.12em] text-accent-text"
        >
          <span>02</span>
          <span aria-hidden className="h-px w-8 bg-accent-text/50" />
          <span className="text-muted">{t('nav.projects')}</span>
        </Reveal>
        <SplitHeading as="h1" trigger="mount" className="text-h2">
          <Trans t={t} i18nKey="projects.indexTitle" components={accent} />
        </SplitHeading>
        <Reveal as="p" delay={0.15} className="mt-6 max-w-[62ch]">
          {t('projects.indexIntro')}
        </Reveal>
      </header>

      <Reveal className="mb-10">
        <ProjectFilters
          categories={categories}
          techs={techs}
          category={category}
          tech={tech}
          onCategory={(id) => update('cat', id)}
          onTech={(id) => update('tech', id)}
          onClear={() => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true })}
        />
      </Reveal>

      <p aria-live="polite" className="mb-6 font-mono text-label uppercase tracking-[0.12em] text-muted">
        {t('projects.count', { count: visible.length })}
      </p>

      {visible.length > 0 ? (
        <ProjectGrid projects={visible} />
      ) : (
        <p className="rounded-lg border border-line bg-surface-1 p-8 text-center">{t('projects.noResults')}</p>
      )}
    </Container>
  )
}
