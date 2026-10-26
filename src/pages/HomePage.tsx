import { useTranslation } from 'react-i18next'
import Inicio from '../sections/Inicio/Inicio'
import SobreMi from '../sections/SobreMi/SobreMi'
import Proyectos from '../sections/Proyectos/Proyectos'
import Tecnologias from '../sections/Tecnologias/Tecnologias'
import Contacto from '../sections/Contacto/Contacto'

/**
 * Navbar, pie, fondo y scroll viven en `LocaleLayout`. Mientras se rehacen las secciones
 * (Fases 5–9) el home sigue siendo el diseño anterior, en español, dentro de `legacy-shell`. Los textos ES/EN definitivos ya están en `home.json` de cada idioma.
 */
export default function HomePage() {
  const { t } = useTranslation('seo')

  return (
    <div className="legacy-shell">
      <title>{t('home.title')}</title>
      <meta name="description" content={t('home.description')} />
      <div className="legacy-shell__inner">
        <main>
          <Inicio />
          <SobreMi />
          <Proyectos />
          <Tecnologias />
          <Contacto />
        </main>
      </div>
    </div>
  )
}
