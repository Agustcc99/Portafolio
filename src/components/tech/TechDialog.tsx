import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getProject } from '../../content/projects'
import { techLabels, techMeta, type TechLevel } from '../../content/technologies'
import { useContentText } from '../../hooks/useContentText'
import { paths, type Locale } from '../../i18n/paths'
import { cn } from '../../lib/cn'
import { SiteLink } from '../layout/SiteLink'
import { Dialog } from '../ui/Dialog'

interface TechDialogProps {
  /** Se mantiene al cerrar para que el contenido no desaparezca durante el fundido de salida. */
  slug: string
  open: boolean
  onClose: () => void
}

/** Proyecto relacionado: enlaza a su detalle, salvo este mismo sitio (`portfolio`). */
interface RelatedProject {
  key: string
  title: string
  href: string | null
}

const levelSteps: Record<TechLevel, number> = { main: 3, projects: 2, learning: 1 }

/** Marcador de nivel de tres pasos (decorativo: el nivel se dice también en texto). */
function LevelMeter({ level }: { level: TechLevel }) {
  return (
    <span aria-hidden className="flex gap-1">
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={cn('h-1.5 w-5 rounded-pill', step <= levelSteps[level] ? 'bg-accent-text' : 'bg-line-strong')}
        />
      ))}
    </span>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-5">
      <h3 className="mb-3 font-mono text-label font-normal uppercase tracking-[0.12em] text-muted">{title}</h3>
      {children}
    </section>
  )
}

const bullets = 'list-disc space-y-1.5 pl-5 marker:text-accent-text text-small'

/**
 * Ficha de una tecnología sobre el `<dialog>` nativo (`ui/Dialog`): nivel, para qué se usa, qué
 * se desarrolló con ella y los proyectos donde aparece, que enlazan a su página de detalle.
 */
export function TechDialog({ slug, open, onClose }: TechDialogProps) {
  const { t } = useTranslation()
  const { t: tt } = useTranslation('tech')
  const { tech, project, locale } = useContentText()

  const name = techLabels[slug] ?? slug
  const meta = techMeta[slug]
  const text = tech(slug)
  if (!meta) return null

  const projects = meta.projects.flatMap((ref): RelatedProject[] => {
    if (ref === 'portfolio') return [{ key: ref, title: t('portfolioName'), href: null }]
    const data = getProject(ref)
    return data
      ? [{ key: ref, title: project(ref)?.title ?? ref, href: paths.project(locale as Locale, ref) }]
      : []
  })

  return (
    <Dialog open={open} onClose={onClose} label={name}>
      <div data-dialog-backdrop className="flex h-full items-center justify-center p-4">
        <div className="dialog-panel relative max-h-[calc(100svh-2rem)] w-full max-w-[34rem] overflow-y-auto rounded-lg border border-line-strong bg-surface-1 p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] sm:p-8">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label={t('tech.closeDetail')}
            className="absolute top-4 right-4 inline-flex size-10 cursor-pointer items-center justify-center rounded-pill border border-line-strong text-strong transition-colors duration-(--duration-base) hover:border-accent-text hover:text-accent-text"
          >
            <X size={18} aria-hidden />
          </button>

          <p className="mb-4 flex items-center gap-3 font-mono text-label uppercase tracking-[0.12em] text-muted">
            <LevelMeter level={meta.level} />
            <span>
              <span className="sr-only">{t('tech.level')}: </span>
              {tt(`levels.${meta.level}.label`)}
            </span>
          </p>
          <h2 className="mb-6 pr-12 text-h3 text-[length:clamp(1.75rem,1.4rem+1.4vw,2.25rem)]">{name}</h2>

          <div className="flex flex-col gap-5">
            {text && text.usedFor.length > 0 && (
              <Block title={t('tech.usedFor')}>
                <ul className={bullets}>
                  {text.usedFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Block>
            )}
            {text && text.features.length > 0 && (
              <Block title={t('tech.features')}>
                <ul className={bullets}>
                  {text.features.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Block>
            )}
            {projects.length > 0 && (
              <Block title={t('tech.projects')}>
                <ul className="flex flex-col gap-2 text-small">
                  {projects.map(({ key, title, href }) => (
                    <li key={key}>
                      {href ? (
                        <SiteLink
                          to={href}
                          onClick={onClose}
                          className="rounded-sm text-strong underline decoration-line-strong underline-offset-4 transition-colors duration-(--duration-base) hover:text-accent-text hover:decoration-accent-text"
                        >
                          {title}
                        </SiteLink>
                      ) : (
                        <span className="text-strong">{title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Block>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  )
}
