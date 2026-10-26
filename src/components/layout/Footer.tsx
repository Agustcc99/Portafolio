import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { site } from '../../config/site'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import type { Locale } from '../../i18n/paths'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { LangSwitch } from './LangSwitch'
import { Monogram } from './Monogram'
import { MotionToggle } from './MotionToggle'
import { navLabelKey, sectionHref, sectionIds } from './navItems'
import { SiteLink } from './SiteLink'
import { ThemeToggle } from './ThemeToggle'

const linkClass =
  'inline-flex items-center gap-1 rounded-sm text-text transition-colors duration-(--duration-base) hover:text-strong'

function ColumnTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-4 font-mono text-label font-normal uppercase tracking-[0.12em] text-muted">
      {children}
    </h2>
  )
}

export function Footer() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { scrollTo } = useSmoothScroll()

  const social = [
    { label: 'GitHub', href: site.github },
    { label: 'WhatsApp', href: site.whatsapp },
    { label: 'Email', href: `mailto:${site.email}` },
    ...(site.linkedin ? [{ label: 'LinkedIn', href: site.linkedin }] : []),
  ]

  return (
    <footer data-page-end className="border-t border-line">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col items-start gap-5">
          <SiteLink
            to={sectionHref(locale, 'home')}
            className="flex items-center gap-2.5 rounded-pill font-display text-h3 font-bold text-strong"
          >
            <Monogram className="size-10" />
            <span className="tracking-tight">
              Agustín<span className="text-accent-text">.dev</span>
            </span>
          </SiteLink>
          <p className="max-w-[34ch] text-small">{t('footer.tagline')}</p>
          <Button variant="secondary" onClick={() => scrollTo(0)}>
            <ArrowUp size={16} aria-hidden />
            {t('footer.backToTop')}
          </Button>
        </div>

        <nav aria-label={t('footer.navLabel')}>
          <ColumnTitle>{t('footer.navTitle')}</ColumnTitle>
          <ul className="flex flex-col gap-2.5">
            {sectionIds.map((id) => (
              <li key={id}>
                <SiteLink to={sectionHref(locale, id)} className={linkClass}>
                  {t(navLabelKey(id))}
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <ColumnTitle>{t('footer.socialTitle')}</ColumnTitle>
          <ul className="flex flex-col gap-2.5">
            {social.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className={linkClass}
                  {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {label}
                  <ArrowUpRight size={14} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-6">
          <p className="font-mono text-label tracking-[0.04em] text-muted">
            {t('footer.rights', { year: new Date().getFullYear() })} {t('footer.builtWith')}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <LangSwitch />
            <ThemeToggle />
            <MotionToggle />
          </div>
        </Container>
      </div>
    </footer>
  )
}
