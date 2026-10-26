import { Navigate, Route, Routes } from 'react-router'
import { LocaleLayout } from './components/layout/LocaleLayout'
import { detectLocale, locales, paths, segments } from './i18n/paths'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import { ProjectDetailPage, ProjectsIndexPage } from './pages/lazyPages'

/** `/` → idioma guardado o del navegador (en producción lo adelanta `vercel.json`, Fase 11). */
function RootRedirect() {
  return <Navigate to={paths.home(detectLocale())} replace />
}

/** Rutas fuera de `/es` y `/en` (p. ej. `/foo`): el 404 usa el shell del idioma guardado o del navegador. */
function DetectedLayout() {
  return <LocaleLayout locale={detectLocale()} />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      {locales.map((locale) => (
        <Route key={locale} path={locale} element={<LocaleLayout locale={locale} />}>
          <Route index element={<HomePage />} />
          <Route path={segments[locale].projects} element={<ProjectsIndexPage />} />
          <Route path={`${segments[locale].projects}/:slug`} element={<ProjectDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      ))}
      <Route element={<DetectedLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
