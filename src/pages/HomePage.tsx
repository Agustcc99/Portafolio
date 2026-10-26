import { useTranslation } from 'react-i18next'
import { About } from '../sections/About/About'
import Contacto from '../sections/Contacto/Contacto'
import { Hero } from '../sections/Hero/Hero'
import { Projects } from '../sections/Projects/Projects'
import Tecnologias from '../sections/Tecnologias/Tecnologias'

/**
 * Navbar, pie, fondo y scroll viven en `LocaleLayout`. Hero, Sobre mí y Proyectos ya usan el sistema
 * nuevo (ES/EN); Tecnologías y Contacto siguen siendo el diseño anterior, en español, dentro
 * de `legacy-shell` hasta las Fases 8–9.
 */
export default function HomePage() {
  const { t } = useTranslation('seo')

  return (
    <main>
      <title>{t('home.title')}</title>
      <meta name="description" content={t('home.description')} />
      <Hero />
      <About />
      <Projects />
      <div className="legacy-shell">
        <div className="legacy-shell__inner">
          <Tecnologias />
          <Contacto />
        </div>
      </div>
    </main>
  )
}
