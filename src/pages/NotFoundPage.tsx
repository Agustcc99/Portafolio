import { ArrowLeft } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { SiteLink } from '../components/layout/SiteLink'
import { buttonClasses } from '../components/ui/buttonClasses'
import { Container } from '../components/ui/Container'
import { Reveal, RevealGroup } from '../components/ui/Reveal'
import { detectLocale, isLocale, paths } from '../i18n/paths'

/**
 * 404 dentro del shell del sitio (navbar, fondo y pie): sirve tanto para rutas desconocidas como
 * para un proyecto inexistente. Los enlaces de vuelta usan el idioma activo (o el detectado).
 */
export default function NotFoundPage() {
  const { t, i18n } = useTranslation()
  const locale = isLocale(i18n.language) ? i18n.language : detectLocale()
  const accent = { em: <em className="font-serif font-normal text-accent-text" /> }

  return (
    <Container
      as="main"
      className="flex min-h-svh flex-col items-start justify-center py-[clamp(7rem,14vw,10rem)]"
    >
      <title>{t('notFound.title')}</title>
      <meta name="robots" content="noindex" />

      <RevealGroup className="flex flex-col items-start gap-6">
        <Reveal
          as="p"
          className="flex items-center gap-3 font-mono text-label uppercase tracking-[0.12em] text-accent-text"
        >
          <span>404</span>
          <span aria-hidden className="h-px w-8 bg-accent-text/50" />
          <span className="text-muted">{t('notFound.label')}</span>
        </Reveal>

        <Reveal>
          {/* Cifra decorativa: el título real es el <h1> de abajo. */}
          <p
            aria-hidden
            className="font-serif text-[clamp(7rem,28vw,18rem)] leading-[0.85] text-accent-text italic select-none"
          >
            404
          </p>
        </Reveal>

        <Reveal>
          <h1 className="text-h2">
            <Trans t={t} i18nKey="notFound.heading" components={accent} />
          </h1>
        </Reveal>

        <Reveal as="p" className="max-w-[56ch] text-pretty">
          {t('notFound.text')}
        </Reveal>

        <Reveal className="mt-2 flex flex-wrap gap-3">
          <SiteLink to={paths.home(locale)} className={buttonClasses({ size: 'lg' }, 'group')}>
            <ArrowLeft
              size={18}
              aria-hidden
              className="transition-transform duration-(--duration-base) ease-out-expo group-hover:-translate-x-0.5"
            />
            {t('notFound.back')}
          </SiteLink>
          <SiteLink to={paths.projects(locale)} className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
            {t('notFound.projects')}
          </SiteLink>
        </Reveal>
      </RevealGroup>
    </Container>
  )
}
