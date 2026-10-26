import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { ButtonLink } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Container } from '../components/ui/Container'
import { ProjectImage } from '../components/ui/ProjectImage'
import { getNeighbours, getProject } from '../content/projects'
import { techLabels } from '../content/technologies'
import { useContentText } from '../hooks/useContentText'
import { paths, type Locale } from '../i18n/paths'
import NotFoundPage from './NotFoundPage'

/** Versión de datos crudos de la Fase 2: el diseño del detalle llega en la Fase 7. */
export default function ProjectDetailPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const { t: tp } = useTranslation('projects')
  const { t: ts } = useTranslation('seo')
  const { project, locale } = useContentText()

  const data = getProject(slug)
  const text = data ? project(data.slug) : null
  if (!data || !text) return <NotFoundPage />

  const neighbours = getNeighbours(data.slug)
  const cover = data.images[0]

  return (
    <Container as="main" className="py-24">
      <title>{ts('project.title', { title: text.title })}</title>
      <meta name="description" content={text.short} />
      <Link to={paths.projects(locale as Locale)} className="text-small text-accent-text underline underline-offset-4">
        ← {t('projects.backToProjects')}
      </Link>

      <header className="mt-8">
        <Chip>{tp(`categories.${data.category}`)}</Chip>
        <h1 className="mt-4 text-h2">{text.title}</h1>
        <p className="mt-4 max-w-[68ch]">{text.short}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {data.links.demo && (
            <ButtonLink href={data.links.demo} target="_blank" rel="noreferrer">
              {text.demoLabel}
            </ButtonLink>
          )}
          {data.links.code ? (
            <ButtonLink variant="secondary" href={data.links.code} target="_blank" rel="noreferrer">
              {t('projects.viewCode')}
            </ButtonLink>
          ) : (
            <span className="text-small text-muted">{t('projects.noCode')}</span>
          )}
        </div>
      </header>

      {cover && (
        <ProjectImage
          image={cover}
          alt={t('projects.imageAlt', { n: 1, title: text.title })}
          sizes="(min-width: 1280px) 1200px, 100vw"
          priority
          className="mt-10 rounded-lg border border-line"
        />
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-10">
          <section>
            <h2 className="text-h3">{t('projects.objective')}</h2>
            <p className="mt-3 max-w-[68ch]">{text.objective}</p>
          </section>
          <section>
            <h2 className="text-h3">{t('projects.description')}</h2>
            <p className="mt-3 max-w-[68ch]">{text.long}</p>
          </section>
          <section>
            <h2 className="text-h3">{t('projects.features')}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {text.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-h3">{t('projects.learnings')}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {text.learnings.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside>
          <h2 className="text-h3">{t('projects.technologies')}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {data.techs.map((tech) => (
              <li key={tech}>
                <Chip>{techLabels[tech] ?? tech}</Chip>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {data.images.length > 1 && (
        <section className="mt-16">
          <h2 className="text-h3">{t('projects.gallery')}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {data.images.slice(1).map((image, i) => (
              <li key={image}>
                <ProjectImage
                  image={image}
                  alt={t('projects.imageAlt', { n: i + 2, title: text.title })}
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="rounded-md border border-line"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {neighbours && (
        <nav className="mt-16 flex justify-between gap-4 border-t border-line pt-6 text-small">
          <Link to={paths.project(locale as Locale, neighbours.prev.slug)} className="text-accent-text underline underline-offset-4">
            ← {t('projects.previous')}: {project(neighbours.prev.slug)?.title}
          </Link>
          <Link to={paths.project(locale as Locale, neighbours.next.slug)} className="text-right text-accent-text underline underline-offset-4">
            {t('projects.next')}: {project(neighbours.next.slug)?.title} →
          </Link>
        </nav>
      )}
    </Container>
  )
}
