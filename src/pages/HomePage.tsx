import { useTranslation } from 'react-i18next'
import { About } from '../sections/About/About'
import Contacto from '../sections/Contacto/Contacto'
import { Hero } from '../sections/Hero/Hero'
import Proyectos from '../sections/Proyectos/Proyectos'
import Tecnologias from '../sections/Tecnologias/Tecnologias'

/**
 * Navbar, pie, fondo y scroll viven en `LocaleLayout`. Hero y Sobre mí ya usan el sistema nuevo
 * (ES/EN); Proyectos, Tecnologías y Contacto siguen siendo el diseño anterior, en español, dentro
 * de `legacy-shell` hasta las Fases 7–9.
 */
export default function HomePage() {
  const { t } = useTranslation('seo')

  return (
    <main>
      <title>{t('home.title')}</title>
      <meta name="description" content={t('home.description')} />
      <Hero />
      <About />
      <div className="legacy-shell">
        <div className="legacy-shell__inner">
          <Proyectos />
          <Tecnologias />
          <Contacto />
        </div>
      </div>
    </main>
  )
}
