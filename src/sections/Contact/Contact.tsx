import { ArrowUpRight } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { ContactPortal } from '../../components/contact/ContactPortal'
import { CopyEmail } from '../../components/contact/CopyEmail'
import { Container } from '../../components/ui/Container'
import { Reveal } from '../../components/ui/Reveal'
import { SectionHeading } from '../../components/ui/SectionHeading'
import { site } from '../../config/site'

const linkClass =
  'inline-flex min-h-11 items-center gap-1 rounded-pill px-3 text-small font-medium text-text transition-colors duration-(--duration-base) hover:text-accent-text'

/** Contacto: portal hacia WhatsApp y, debajo, copiar el email y enlaces a GitHub (y LinkedIn si existe). */
export function Contact() {
  const { t } = useTranslation('home')
  const accent = { em: <em className="font-serif font-normal text-accent-text" /> }

  return (
    <section id="contact" className="py-[clamp(5rem,12vw,10rem)]">
      <Container>
        <SectionHeading
          index="04"
          label={t('contact.label')}
          title={<Trans t={t} i18nKey="contact.title" components={accent} />}
        />

        <Reveal>
          <ContactPortal />
        </Reveal>

        <Reveal as="ul" className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <li>
            <CopyEmail />
          </li>
          <li>
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer"
              aria-label={t('contact.githubAria')}
              className={linkClass}
            >
              GitHub
              <ArrowUpRight size={14} aria-hidden />
            </a>
          </li>
          {site.linkedin && (
            <li>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label={t('contact.linkedinAria')}
                className={linkClass}
              >
                LinkedIn
                <ArrowUpRight size={14} aria-hidden />
              </a>
            </li>
          )}
        </Reveal>
      </Container>
    </section>
  )
}
