import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Chip } from '../components/ui/Chip'
import { Container } from '../components/ui/Container'
import { ProjectImage } from '../components/ui/ProjectImage'
import { projects } from '../content/projects'
import { techLabels } from '../content/technologies'
import { useContentText } from '../hooks/useContentText'
import { paths, type Locale } from '../i18n/paths'

/** Versión de datos crudos de la Fase 2: el índice con filtros llega en la Fase 7. */
export default function ProjectsIndexPage() {
  const { t } = useTranslation()
  const { t: tp } = useTranslation('projects')
  const { t: ts } = useTranslation('seo')
  const { t: tc } = useTranslation('common')
  const { project, locale } = useContentText()

  return (
    <Container as="main" className="py-24">
      <title>{ts('projects.title')}</title>
      <meta name="description" content={ts('projects.description')} />
      <h1 className="text-h2">{t('projects.indexTitle')}</h1>
      <p className="mt-4 max-w-[60ch]">{t('projects.indexIntro')}</p>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const text = project(p.slug)
          const cover = p.images[0]
          return (
            <li key={p.slug} className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface-1">
              {cover && text && (
                <ProjectImage
                  image={cover}
                  alt={tc('projects.imageAlt', { n: 1, title: text.title })}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="aspect-video object-cover object-top"
                />
              )}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <Chip className="self-start">{tp(`categories.${p.category}`)}</Chip>
                <h2 className="text-h3">{text?.title ?? p.slug}</h2>
                <p className="text-small">{text?.short}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {p.techs.slice(0, 4).map((tech) => (
                    <li key={tech}>
                      <Chip>{techLabels[tech] ?? tech}</Chip>
                    </li>
                  ))}
                </ul>
                <Link
                  to={paths.project(locale as Locale, p.slug)}
                  className="mt-auto pt-2 text-small font-medium text-accent-text underline underline-offset-4"
                >
                  {t('projects.viewCase')}
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </Container>
  )
}
