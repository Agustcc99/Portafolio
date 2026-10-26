import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProjectData } from '../../content/projects'
import { techLabels } from '../../content/technologies'
import { useContentText } from '../../hooks/useContentText'
import { paths, type Locale } from '../../i18n/paths'
import { cn } from '../../lib/cn'
import { coverTransitionName, nameCover } from '../../lib/sharedCover'
import { SiteLink } from '../layout/SiteLink'
import { Chip } from '../ui/Chip'
import { CoverPlaceholder } from './CoverPlaceholder'
import { ProjectImage } from '../ui/ProjectImage'

/** Etiquetas de tecnología visibles en la tarjeta; el resto se ve en el detalle. */
const MAX_TECH_CHIPS = 4

interface ProjectCardProps {
  project: ProjectData
  /** `sizes` de la portada según el ancho que ocupa la tarjeta en cada contexto. */
  sizes: string
  /** Portada LCP de la página (índice): carga inmediata con prioridad alta. */
  priority?: boolean
  /** Nivel del título: `h3` bajo la sección del home, `h2` bajo el `h1` del índice. */
  headingLevel?: 'h2' | 'h3'
  className?: string
}

/**
 * Tarjeta de proyecto (carrusel del home e índice): portada, categoría, título, una línea,
 * hasta 4 tecnologías y la invitación a ver el caso. Toda la tarjeta es clicable a través del
 * enlace del título, que se estira sobre ella. La portada lleva `view-transition-name` solo
 * cuando es la que se está abriendo (`lib/sharedCover`).
 */
export function ProjectCard({ project, sizes, priority, headingLevel: Heading = 'h3', className }: ProjectCardProps) {
  const { t } = useTranslation()
  const { t: tp } = useTranslation('projects')
  const { project: text, locale } = useContentText()
  const cover = useRef<HTMLDivElement>(null)

  const content = text(project.slug)
  const image = project.images[0]
  const title = content?.title ?? project.slug

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface-1',
        'shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition-colors duration-(--duration-slow) hover:border-line-strong',
        className,
      )}
    >
      <div
        ref={cover}
        className="relative aspect-[16/10] overflow-hidden border-b border-line bg-surface-2"
        style={{ viewTransitionName: coverTransitionName(project.slug) }}
      >
        {image ? (
          <ProjectImage
            image={image}
            alt=""
            sizes={sizes}
            priority={priority}
            draggable={false}
            pictureClassName="block size-full"
            className="size-full object-cover object-top transition-transform duration-(--duration-slow) ease-out-expo group-hover:scale-[1.03]"
          />
        ) : (
          <CoverPlaceholder label={tp(`categories.${project.category}`)} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <Chip>{tp(`categories.${project.category}`)}</Chip>
          <span aria-hidden className="font-mono text-label tracking-[0.12em] text-muted">
            {String(project.order).padStart(2, '0')}
          </span>
        </div>

        <Heading className="line-clamp-3 text-h3">
          <SiteLink
            to={paths.project(locale as Locale, project.slug)}
            onClick={() => nameCover(cover.current, project.slug)}
            className="rounded-sm outline-offset-4 after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </SiteLink>
        </Heading>

        <p className="line-clamp-3 text-small text-pretty">{content?.short}</p>

        <ul className="mt-auto flex flex-wrap gap-1.5">
          {project.techs.slice(0, MAX_TECH_CHIPS).map((tech) => (
            <li key={tech}>
              <Chip>{techLabels[tech] ?? tech}</Chip>
            </li>
          ))}
        </ul>

        <span
          aria-hidden
          className="inline-flex items-center gap-1 text-small font-medium text-accent-text transition-transform duration-(--duration-base) ease-out-expo group-hover:translate-x-0.5"
        >
          {t('projects.viewCase')}
          <ArrowUpRight size={16} />
        </span>
      </div>
    </article>
  )
}
