import { useTranslation } from 'react-i18next'

/** Primer elemento enfocable: salta la navegación y lleva el foco al contenido principal. */
export function SkipLink() {
  const { t } = useTranslation()

  return (
    <a
      href="#main-content"
      onClick={(event) => {
        event.preventDefault()
        const main = document.getElementById('main-content')
        main?.focus({ preventScroll: true })
        main?.scrollIntoView({ block: 'start' })
      }}
      className="fixed top-4 left-4 z-[120] -translate-y-24 rounded-pill bg-accent px-5 py-3 text-small font-medium text-accent-ink transition-transform duration-(--duration-base) ease-out-expo focus-visible:translate-y-0"
    >
      {t('a11y.skipToContent')}
    </a>
  )
}
