import { ArrowUpRight } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { SiteLink } from '../../components/layout/SiteLink'
import { BentoTile } from '../../components/ui/BentoTile'
import { Chip } from '../../components/ui/Chip'
import { Container } from '../../components/ui/Container'
import { Reveal, RevealGroup } from '../../components/ui/Reveal'
import { SectionHeading } from '../../components/ui/SectionHeading'
import { techLabels } from '../../content/technologies'

/** Slugs de `technologies.ts` que se muestran en la tesela "Stack principal". */
const mainStack = ['javascript', 'react', 'nodejs', 'express', 'mongodb', 'git']

function TileTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-4 font-mono text-label font-normal uppercase tracking-[0.12em] text-muted">
      {children}
    </h3>
  )
}

/** Sobre mí: bento de 6 teselas (12 columnas en escritorio, 2 en tablet, 1 en móvil). */
export function About() {
  const { t } = useTranslation('home')
  const accent = { em: <em className="font-serif font-normal text-accent-text" /> }

  return (
    <section id="about" className="py-[clamp(5rem,12vw,10rem)]">
      <Container>
        <SectionHeading
          index="01"
          label={t('about.label')}
          title={<Trans t={t} i18nKey="about.title" components={accent} />}
          description={t('about.description')}
        />

        <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
          <Reveal className="md:col-span-2 lg:col-span-7 lg:row-span-2">
            <BentoTile className="flex flex-col justify-center sm:p-10">
              <TileTitle>{t('about.who.title')}</TileTitle>
              <p className="font-display text-h3 leading-snug font-medium text-strong text-pretty md:text-[1.75rem]">
                {t('about.who.text')}
              </p>
            </BentoTile>
          </Reveal>

          <Reveal className="lg:col-span-5">
            <BentoTile>
              <TileTitle>{t('about.seek.title')}</TileTitle>
              <p className="text-pretty">{t('about.seek.text')}</p>
            </BentoTile>
          </Reveal>

          <Reveal className="lg:col-span-5">
            <BentoTile>
              <TileTitle>{t('about.how.title')}</TileTitle>
              <p className="text-pretty">{t('about.how.text')}</p>
            </BentoTile>
          </Reveal>

          <Reveal className="md:col-span-2 lg:col-span-4">
            <BentoTile>
              <TileTitle>{t('about.stack.title')}</TileTitle>
              <p className="mb-5">{t('about.stack.text')}</p>
              <ul className="flex flex-wrap gap-2">
                {mainStack.map((id) => (
                  <li key={id}>
                    <Chip>{techLabels[id] ?? id}</Chip>
                  </li>
                ))}
              </ul>
            </BentoTile>
          </Reveal>

          <Reveal className="lg:col-span-5">
            <BentoTile>
              <TileTitle>{t('about.kitchen.title')}</TileTitle>
              <p className="text-pretty">{t('about.kitchen.text')}</p>
            </BentoTile>
          </Reveal>

          <Reveal className="lg:col-span-3">
            <BentoTile className="flex flex-col justify-between gap-6">
              <div>
                <TileTitle>{t('about.availability.title')}</TileTitle>
                <p className="mb-2 flex items-center gap-2.5 font-medium text-strong">
                  <span aria-hidden className="size-2 rounded-full bg-accent-text" />
                  {t('about.availability.status')}
                </p>
                <p className="text-small">{t('about.availability.text')}</p>
              </div>
              <SiteLink
                to="#contact"
                className="inline-flex items-center gap-1 self-start rounded-sm text-small font-medium text-accent-text underline-offset-4 hover:underline"
              >
                {t('about.availability.cta')}
                <ArrowUpRight size={16} aria-hidden />
              </SiteLink>
            </BentoTile>
          </Reveal>
        </RevealGroup>
      </Container>
    </section>
  )
}
