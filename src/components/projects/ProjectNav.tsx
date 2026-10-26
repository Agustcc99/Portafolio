import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProjectData } from '../../content/projects'
import { useContentText } from '../../hooks/useContentText'
import { paths, type Locale } from '../../i18n/paths'
import { cn } from '../../lib/cn'
import { SiteLink } from '../layout/SiteLink'

interface ProjectNavProps {
  prev: ProjectData
  next: ProjectData
  /** Se llama antes de navegar con el proyecto de destino (para la transición compartida). */
  onNavigate: (slug: string) => void
}

/** Navegación "Anterior / Siguiente proyecto" (circular) al pie del detalle. */
export function ProjectNav({ prev, next, onNavigate }: ProjectNavProps) {
  const { t } = useTranslation()
  const { project, locale } = useContentText()

  const tile = (target: ProjectData, direction: 'prev' | 'next') => {
    const isNext = direction === 'next'
    const Arrow = isNext ? ArrowRight : ArrowLeft
    return (
      <SiteLink
        to={paths.project(locale as Locale, target.slug)}
        onClick={() => onNavigate(target.slug)}
        className={cn(
          'group flex flex-col gap-3 rounded-lg border border-line bg-surface-1 p-6 transition-colors duration-(--duration-slow) hover:border-accent-text sm:p-8',
          isNext && 'items-end text-right',
        )}
      >
        <span className="inline-flex items-center gap-2 font-mono text-label uppercase tracking-[0.12em] text-muted">
          {!isNext && (
            <Arrow
              size={16}
              aria-hidden
              className="transition-transform duration-(--duration-base) ease-out-expo group-hover:-translate-x-1"
            />
          )}
          {t(isNext ? 'projects.next' : 'projects.previous')}
          {isNext && (
            <Arrow
              size={16}
              aria-hidden
              className="transition-transform duration-(--duration-base) ease-out-expo group-hover:translate-x-1"
            />
          )}
        </span>
        <span className="font-display text-h3 font-bold text-strong text-balance">
          {project(target.slug)?.title ?? target.slug}
        </span>
      </SiteLink>
    )
  }

  return (
    <nav aria-label={t('projects.projectNav')} className="grid gap-4 sm:grid-cols-2">
      {tile(prev, 'prev')}
      {tile(next, 'next')}
    </nav>
  )
}
