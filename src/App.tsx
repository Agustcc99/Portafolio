import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar/Navbar'
import Inicio from './sections/Inicio/Inicio'
import SobreMi from './sections/SobreMi/SobreMi'
import Proyectos from './sections/Proyectos/Proyectos'
import Tecnologias from './sections/Tecnologias/Tecnologias'
import Contacto from './sections/Contacto/Contacto'
import Footer from './sections/Footer/Footer'

// Página de desarrollo (solo `npm run dev`): no entra al build de producción.
const Styleguide = import.meta.env.DEV ? lazy(() => import('./pages/Styleguide')) : null
const isStyleguide = window.location.pathname.replace(/\/$/, '') === '/__styleguide'

function App() {
  if (Styleguide && isStyleguide) {
    return (
      <Suspense fallback={null}>
        <Styleguide />
      </Suspense>
    )
  }

  // `legacy-shell` es un wrapper temporal con el estilo anterior; se retira sección a sección.
  return (
    <div className="legacy-shell">
      <div className="legacy-shell__inner">
        <Navbar />

        <main>
          <Inicio />
          <SobreMi />
          <Proyectos />
          <Tecnologias />
          <Contacto />
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default App
