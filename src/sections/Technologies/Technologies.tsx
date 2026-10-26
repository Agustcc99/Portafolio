import { Trans, useTranslation } from 'react-i18next'
import { Container } from '../../components/ui/Container'
import { Reveal } from '../../components/ui/Reveal'
import { SectionHeading } from '../../components/ui/SectionHeading'
import { TechMap } from '../../components/tech/TechMap'

/** Tecnologías: mapa de arquitectura con fichas por tecnología. */
export function Technologies() {
  const { t } = useTranslation('home')
  const accent = { em: <em className="font-serif font-normal text-accent-text" /> }

  return (
    <section id="tech" aria-labelledby="tech-map-label" className="py-[clamp(5rem,12vw,10rem)]">
      <Container>
        <SectionHeading
          index="03"
          label={t('tech.label')}
          title={<Trans t={t} i18nKey="tech.title" components={accent} />}
          description={
            <>
              {t('tech.description')} <span className="text-muted">{t('tech.summary')}</span>
            </>
          }
        />
        <p id="tech-map-label" className="sr-only">
          {t('tech.mapLabel')}
        </p>
        <Reveal>
          <div role="group" aria-labelledby="tech-map-label">
            <TechMap />
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
