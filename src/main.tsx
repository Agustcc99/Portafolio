import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './styles/index.css'
import './styles/effects.css'
import App from './App'
import { initI18n } from './i18n'
import { detectLocale, isLocale } from './i18n/paths'
import { MotionPrefsProvider } from './providers/MotionPrefsProvider'
import { SmoothScrollProvider } from './providers/SmoothScrollProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { ToastProvider } from './providers/ToastProvider'

const root = document.getElementById('root')
if (!root) throw new Error('No se encontró #root')

// El idioma inicial sale de la URL (`/en/...`); en `/` o rutas desconocidas, de la preferencia guardada.
const firstSegment = window.location.pathname.split('/')[1]
const initialLocale = isLocale(firstSegment) ? firstSegment : detectLocale()

initI18n(initialLocale).then(() => {
  createRoot(root).render(
    <StrictMode>
      <ThemeProvider>
        <MotionPrefsProvider>
          <SmoothScrollProvider>
            <ToastProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ToastProvider>
          </SmoothScrollProvider>
        </MotionPrefsProvider>
      </ThemeProvider>
    </StrictMode>,
  )
})
