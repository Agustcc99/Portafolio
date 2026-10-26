import { ArrowRight } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { SiteLink } from '../../components/layout/SiteLink'
import { buttonClasses } from '../../components/ui/buttonClasses'
import { Container } from '../../components/ui/Container'
import { Reveal } from '../../components/ui/Reveal'
import { SectionHeading } from '../../components/ui/SectionHeading'
import { ProjectCarousel3D } from '../../components/projects/ProjectCarousel3D'
import { featuredProjects, projects } from '../../content/projects'
import { useContentText } from '../../hooks/useContentText'
import { paths, type Locale } from '../../i18n/paths'

/** Proyectos del home: carrusel 3D con los destacados y enlace al índice completo (el `<section>` lo da `DeferredSection`). */
export function Projects() {
  const { t } = useTranslation('home')
  const { t: tc } = useTranslation()
  const { locale } = useContentText()
  const accent = { em: <em className="font-serif font-normal text-accent-text" /> }

  return (
    <Container>
      <SectionHeading
        index="02"
        label={t('projects.label')}
        title={<Trans t={t} i18nKey="projects.title" components={accent} />}
        description={t('projects.description')}
      />

      <Reveal>
        <ProjectCarousel3D projects={featuredProjects} />
      </Reveal>

      <Reveal className="mt-12 flex justify-center md:mt-16">
        <SiteLink
          to={paths.projects(locale as Locale)}
          className={buttonClasses({ variant: 'secondary', size: 'lg' }, 'group')}
        >
          {tc('projects.viewAll', { count: projects.length })}
          <ArrowRight
            size={18}
            aria-hidden
            className="transition-transform duration-(--duration-base) ease-out-expo group-hover:translate-x-0.5"
          />
        </SiteLink>
      </Reveal>
    </Container>
  )
}
