import { useTranslation } from 'react-i18next'
import { About } from '../sections/About/About'
import { Contact } from '../sections/Contact/Contact'
import { Hero } from '../sections/Hero/Hero'
import { Projects } from '../sections/Projects/Projects'
import { Technologies } from '../sections/Technologies/Technologies'

/** Navbar, pie, fondo y scroll viven en `LocaleLayout`; acá solo las cinco secciones del home. */
export default function HomePage() {
  const { t } = useTranslation('seo')

  return (
    <main>
      <title>{t('home.title')}</title>
      <meta name="description" content={t('home.description')} />
      <Hero />
      <About />
      <Projects />
      <Technologies />
      <Contact />
    </main>
  )
}
