import { ArrowLeft, ArrowUpRight, Code } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { SiteLink } from '../components/layout/SiteLink'
import { CoverPlaceholder } from '../components/projects/CoverPlaceholder'
import { Gallery } from '../components/projects/Gallery'
import { Lightbox } from '../components/projects/Lightbox'
import { ProjectNav } from '../components/projects/ProjectNav'
import { ButtonLink } from '../components/ui/Button'
import { buttonClasses } from '../components/ui/buttonClasses'
import { Chip } from '../components/ui/Chip'
import { Container } from '../components/ui/Container'
import { ProjectImage } from '../components/ui/ProjectImage'
import { Reveal } from '../components/ui/Reveal'
import { SplitHeading } from '../components/ui/SplitHeading'
import { getNeighbours, getProject, projects } from '../content/projects'
import { techLabels } from '../content/technologies'
import { useContentText } from '../hooks/useContentText'
import { paths, type Locale } from '../i18n/paths'
import { coverTransitionName, nameCover } from '../lib/sharedCover'
import NotFoundPage from './NotFoundPage'

function MetaItem({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <dt className="mb-3 font-mono text-label uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function Block({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <Reveal as="section" className="grid gap-4 border-t border-line pt-8 lg:grid-cols-12 lg:gap-10">
      <h2 className="flex items-baseline gap-3 font-mono text-label font-normal uppercase tracking-[0.12em] text-muted lg:col-span-4">
        <span className="text-accent-text">{index}</span>
        {title}
      </h2>
      <div className="lg:col-span-8">{children}</div>
    </Reveal>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-[2px] bg-accent-text" />
          <span className="text-pretty">{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Detalle de proyecto: portada (transición compartida), datos, secciones, galería con lightbox y navegación. */
export default function ProjectDetailPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const { t: tp } = useTranslation('projects')
  const { t: ts } = useTranslation('seo')
  const { project, locale } = useContentText()
  const cover = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState({ open: false, index: 0 })

  const data = getProject(slug)
  const text = data ? project(data.slug) : null
  if (!data || !text) return <NotFoundPage />

  const neighbours = projects.length > 1 ? getNeighbours(data.slug) : null
  const image = data.images[0]
  const leave = (target: string) => nameCover(cover.current, target)
  const openLightbox = (index: number) => setLightbox({ open: true, index })

  return (
    <Container as="main" className="pt-[clamp(7rem,14vw,10rem)] pb-[clamp(5rem,12vw,10rem)]">
      <title>{ts('project.title', { title: text.title })}</title>
      <meta name="description" content={text.short} />

      <SiteLink
        to={paths.projects(locale as Locale)}
        onClick={() => leave(data.slug)}
        className="group mb-10 inline-flex items-center gap-2 rounded-sm font-mono text-label uppercase tracking-[0.12em] text-muted transition-colors duration-(--duration-base) hover:text-accent-text"
      >
        <ArrowLeft
          size={16}
          aria-hidden
          className="transition-transform duration-(--duration-base) ease-out-expo group-hover:-translate-x-1"
        />
        {t('projects.backToProjects')}
      </SiteLink>

      <header className="mb-10 max-w-[56rem] md:mb-14">
        <Reveal className="mb-5 flex items-center gap-3 font-mono text-label uppercase tracking-[0.12em]">
          <span className="text-accent-text">{String(data.order).padStart(2, '0')}</span>
          <span aria-hidden className="h-px w-8 bg-accent-text/50" />
          <span className="text-muted">{tp(`categories.${data.category}`)}</span>
        </Reveal>
        <SplitHeading as="h1" className="text-[length:clamp(1.9rem,1.1rem+2.9vw,3.5rem)] leading-[1.05] tracking-[-0.03em]">
          {text.title}
        </SplitHeading>
        <Reveal as="p" delay={0.15} className="mt-6 max-w-[62ch] text-pretty">
          {text.short}
        </Reveal>
      </header>

      <Reveal>
        <div
          ref={cover}
          className="aspect-[16/10] overflow-hidden rounded-lg border border-line bg-surface-2 md:aspect-[16/9]"
          style={{ viewTransitionName: coverTransitionName(data.slug) }}
        >
          {image ? (
            <button
              type="button"
              onClick={() => openLightbox(0)}
              aria-label={t('projects.openImage', { n: 1 })}
              aria-haspopup="dialog"
              className="block size-full cursor-zoom-in"
            >
              <ProjectImage
                image={image}
                alt={t('projects.imageAlt', { n: 1, title: text.title })}
                sizes="(min-width: 1280px) 1184px, 100vw"
                priority
                pictureClassName="block size-full"
                className="size-full object-cover object-top"
              />
            </button>
          ) : (
            <CoverPlaceholder label={tp(`categories.${data.category}`)} />
          )}
        </div>
      </Reveal>

      <Reveal as="div" className="mt-8">
        <dl
          aria-label={t('projects.metaLabel')}
          className="grid gap-x-8 gap-y-8 border-y border-line py-8 sm:grid-cols-2 lg:grid-cols-12"
        >
          <MetaItem label={t('projects.category')} className="lg:col-span-2">
            <Chip>{tp(`categories.${data.category}`)}</Chip>
          </MetaItem>
          {data.year && (
            <MetaItem label={t('projects.year')} className="lg:col-span-1">
              <span className="font-mono text-small text-strong">{data.year}</span>
            </MetaItem>
          )}
          <MetaItem label={t('projects.stack')} className="sm:col-span-2 lg:col-span-6">
            <ul className="flex flex-wrap gap-1.5">
              {data.techs.map((tech) => (
                <li key={tech}>
                  <Chip>{techLabels[tech] ?? tech}</Chip>
                </li>
              ))}
            </ul>
          </MetaItem>
          {(data.links.demo || data.links.code) && (
            <MetaItem label={t('projects.links')} className="sm:col-span-2 lg:col-span-3 lg:col-start-10">
              <div className="flex flex-wrap gap-3">
                {data.links.demo && (
                  <ButtonLink href={data.links.demo} target="_blank" rel="noreferrer">
                    {text.demoLabel}
                    <ArrowUpRight size={16} aria-hidden />
                  </ButtonLink>
                )}
                {data.links.code && (
                  <a
                    href={data.links.code}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonClasses({ variant: 'secondary' })}
                  >
                    <Code size={16} aria-hidden />
                    {t('projects.viewCode')}
                  </a>
                )}
              </div>
            </MetaItem>
          )}
        </dl>
      </Reveal>

      <div className="mt-16 flex flex-col gap-12 md:mt-24 md:gap-16">
        <Block index="01" title={t('projects.objective')}>
          <p className="font-display text-h3 leading-snug font-medium text-strong text-pretty">{text.objective}</p>
        </Block>
        <Block index="02" title={t('projects.description')}>
          <p className="max-w-[68ch] text-pretty">{text.long}</p>
        </Block>
        <Block index="03" title={t('projects.features')}>
          <BulletList items={text.features} />
        </Block>
        <Block index="04" title={t('projects.learnings')}>
          <BulletList items={text.learnings} />
        </Block>
      </div>

      {data.images.length > 1 && (
        <section className="mt-16 md:mt-24">
          <Reveal className="mb-8">
            <h2 className="font-mono text-label font-normal uppercase tracking-[0.12em] text-muted">
              <span className="mr-3 text-accent-text">05</span>
              {t('projects.gallery')}
            </h2>
          </Reveal>
          <Gallery images={data.images} title={text.title} onOpen={openLightbox} />
        </section>
      )}

      {neighbours && (
        <div className="mt-16 md:mt-24">
          <ProjectNav prev={neighbours.prev} next={neighbours.next} onNavigate={leave} />
        </div>
      )}

      <Lightbox
        open={lightbox.open}
        images={data.images}
        index={lightbox.index}
        title={text.title}
        onIndexChange={(index) => setLightbox({ open: true, index })}
        onClose={() => setLightbox((state) => ({ ...state, open: false }))}
      />
    </Container>
  )
}
