import { X } from 'lucide-react'
import { useEffect, useRef, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useScrollLock } from '../../hooks/useSmoothScroll'
import type { Locale } from '../../i18n/paths'
import { cn } from '../../lib/cn'
import { buttonClasses } from '../ui/buttonClasses'
import { LangSwitch } from './LangSwitch'
import { Monogram } from './Monogram'
import { MotionToggle } from './MotionToggle'
import { navLabelKey, sectionHref, sectionIds, type SectionId } from './navItems'
import { SiteLink } from './SiteLink'
import { ThemeToggle } from './ThemeToggle'

interface MobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  current: SectionId | null
}

/**
 * Menú a pantalla completa sobre un `<dialog>` modal nativo: trampa de foco, `Escape` y fondo
 * inerte vienen del navegador. El scroll de la página se bloquea mientras está abierto, se cierra
 * al navegar y al pasar al layout de escritorio. Las animaciones de entrada/salida son CSS
 * (`.menu-dialog`, effects.css).
 */
export function MobileMenu({ open, onOpenChange, current }: MobileMenuProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { key } = useLocation()
  const desktop = useMediaQuery('(min-width: 1024px)')
  const dialog = useRef<HTMLDialogElement>(null)
  const initialKey = useRef(key)

  useScrollLock(open)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  useEffect(() => {
    if (key !== initialKey.current) onOpenChange(false)
    initialKey.current = key
  }, [key, onOpenChange])

  useEffect(() => {
    if (desktop) onOpenChange(false)
  }, [desktop, onOpenChange])

  const close = () => onOpenChange(false)

  return (
    <dialog
      ref={dialog}
      id="mobile-menu"
      aria-label={t('nav.menu')}
      onClose={close}
      className="menu-dialog fixed inset-0 m-0 h-svh max-h-none w-full max-w-none overflow-y-auto border-0 bg-bg p-0 text-text"
    >
      <div className="mx-auto flex min-h-svh w-full max-w-[1100px] flex-col px-4 pt-4 pb-8 sm:px-6">
        <div className="flex items-center justify-between">
          <SiteLink
            to={sectionHref(locale, 'home')}
            onClick={close}
            aria-label={t('a11y.goHome')}
            className="flex items-center gap-2.5 rounded-pill font-display font-bold text-strong"
          >
            <Monogram />
            <span className="tracking-tight">
              Agustín<span className="text-accent-text">.dev</span>
            </span>
          </SiteLink>
          <button
            type="button"
            onClick={close}
            autoFocus
            aria-label={t('nav.closeMenu')}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-pill border border-line-strong bg-surface-1 text-strong transition-colors duration-(--duration-base) hover:border-accent-text hover:text-accent-text"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <nav aria-label={t('nav.label')} className="my-auto flex flex-col py-10">
          {sectionIds.map((id, index) => (
            <SiteLink
              key={id}
              to={sectionHref(locale, id)}
              onClick={close}
              aria-current={current === id ? 'location' : undefined}
              style={{ '--i': index } as CSSProperties}
              className={cn(
                'menu-link flex items-baseline gap-4 border-b border-line py-4 font-display text-h2 font-bold tracking-tight transition-colors duration-(--duration-base)',
                current === id ? 'text-accent-text' : 'text-strong hover:text-accent-text',
              )}
            >
              <span className="font-mono text-label font-normal tracking-[0.12em] text-muted">
                {String(index + 1).padStart(2, '0')}
              </span>
              {t(navLabelKey(id))}
            </SiteLink>
          ))}
        </nav>

        <div className="menu-link flex flex-wrap items-center gap-3" style={{ '--i': 5 } as CSSProperties}>
          <LangSwitch />
          <ThemeToggle />
          <MotionToggle />
          <SiteLink
            to={sectionHref(locale, 'contact')}
            onClick={close}
            className={buttonClasses({ size: 'lg' }, 'ml-auto')}
          >
            {t('nav.contact')}
          </SiteLink>
        </div>
      </div>
    </dialog>
  )
}
