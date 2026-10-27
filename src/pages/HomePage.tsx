import { lazy } from 'react'
import { DeferredSection } from '../components/layout/DeferredSection'
import { Seo } from '../components/seo/Seo'
import { About } from '../sections/About/About'
import { Hero } from '../sections/Hero/Hero'

// Lo que queda bajo el pliegue va en chunks aparte: se descarga cuando el navegador está libre y se
// monta al acercarse (ver DeferredSection), así el primer pintado no paga el carrusel, el mapa ni el portal.
const loadProjects = () => import('../sections/Projects/Projects')
const loadTechnologies = () => import('../sections/Technologies/Technologies')
const loadContact = () => import('../sections/Contact/Contact')

const Projects = lazy(() => loadProjects().then((m) => ({ default: m.Projects })))
const Technologies = lazy(() => loadTechnologies().then((m) => ({ default: m.Technologies })))
const Contact = lazy(() => loadContact().then((m) => ({ default: m.Contact })))

const sectionSpacing = 'py-[clamp(2rem,3vw,2.5rem)]'

/** Navbar, pie, fondo y scroll viven en `LocaleLayout`; acá solo las cinco secciones del home. */
export default function HomePage() {
  return (
    <main>
      <Seo kind="home" />
      <Hero />
      <About />
      <DeferredSection id="projects" className={sectionSpacing} prefetch={loadProjects} idleDelay={4}>
        <Projects />
      </DeferredSection>
      <DeferredSection
        id="tech"
        className={sectionSpacing}
        prefetch={loadTechnologies}
        idleDelay={4.5}
        labelledBy="tech-map-label"
      >
        <Technologies />
      </DeferredSection>
      <DeferredSection id="contact" className={sectionSpacing} prefetch={loadContact} idleDelay={5}>
        <Contact />
      </DeferredSection>
    </main>
  )
}
