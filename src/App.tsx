import { lazy, Suspense } from 'react'
import { AppRoutes } from './routes'

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

  return <AppRoutes />
}

export default App
