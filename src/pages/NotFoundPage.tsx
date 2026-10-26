import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { buttonClasses } from '../components/ui/buttonClasses'
import { Container } from '../components/ui/Container'
import { detectLocale, isLocale, paths } from '../i18n/paths'

export default function NotFoundPage() {
  const { t, i18n } = useTranslation()
  const locale = isLocale(i18n.language) ? i18n.language : detectLocale()

  return (
    <Container as="main" className="flex min-h-svh flex-col items-start justify-center gap-6 py-24">
      <title>{t('notFound.title')}</title>
      <meta name="robots" content="noindex" />
      <p className="font-mono text-label uppercase tracking-[0.12em] text-accent-text">404</p>
      <h1 className="text-h2">{t('notFound.title')}</h1>
      <p className="max-w-[60ch]">{t('notFound.text')}</p>
      <Link to={paths.home(locale)} className={buttonClasses({})}>
        {t('notFound.back')}
      </Link>
    </Container>
  )
}
