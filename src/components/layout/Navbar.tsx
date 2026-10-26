import { Menu } from 'lucide-react'
import { m, useMotionValueEvent, useScroll } from 'motion/react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { useActiveSection } from '../../hooks/useActiveSection'
import { paths, type Locale } from '../../i18n/paths'
import { cn } from '../../lib/cn'
import { spring } from '../../lib/motion'
import { buttonClasses } from '../ui/buttonClasses'
import { LangSwitch } from './LangSwitch'
import { MobileMenu } from './MobileMenu'
import { Monogram } from './Monogram'
import { navLabelKey, normalizePath, sectionHref, sectionIds } from './navItems'
import { SiteLink } from './SiteLink'
import { ThemeToggle } from './ThemeToggle'

/**
 * Píldora flotante. Se compacta al hacer scroll, marca la sección visible con un indicador
 * deslizante y, en pantallas chicas, se esconde al bajar y reaparece al subir.
 */
export function Navbar() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { pathname } = useLocation()
  const indicatorId = useId()
  const { scrollY } = useScroll()

  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const path = normalizePath(pathname)
  const isHome = path === paths.home(locale)
  const onProjects = path.startsWith(paths.projects(locale))
  const sectionActive = useActiveSection(sectionIds, isHome)
  const current = isHome ? sectionActive : onProjects ? 'projects' : null

  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    setHidden(y > 160 && y > previous)
  })

  return (
    <>
      <header
        data-vt-name="nav"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4"
      >
        <div
          data-hidden={hidden && !menuOpen}
          data-scrolled={scrolled}
          className={cn(
            'pointer-events-auto flex w-full max-w-[1100px] items-center justify-between gap-2 rounded-pill border border-line bg-surface-1/70 py-2 pr-2 pl-2 backdrop-blur-xl',
            'transition-[transform,background-color,border-color,box-shadow] duration-(--duration-slow) ease-out-expo',
            'data-[scrolled=true]:border-line-strong data-[scrolled=true]:bg-surface-1/85 data-[scrolled=true]:shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]',
            'max-lg:data-[hidden=true]:-translate-y-[150%] max-lg:focus-within:translate-y-0',
          )}
        >
          <SiteLink
            to={paths.home(locale)}
            aria-label={t('a11y.goHome')}
            className="flex items-center gap-2.5 rounded-pill pr-3 font-display font-bold text-strong"
          >
            <Monogram />
            <span className="tracking-tight">
              Agustín<span className="text-accent-text">.dev</span>
            </span>
          </SiteLink>

          <nav aria-label={t('nav.label')} className="hidden items-center gap-1 lg:flex">
            {sectionIds.map((id) => {
              const active = current === id
              return (
                <SiteLink
                  key={id}
                  to={sectionHref(locale, id)}
                  aria-current={active ? 'location' : undefined}
                  className={cn(
                    'pressable relative isolate rounded-pill px-4 py-2 text-small',
                    active ? 'text-strong' : 'text-text hover:text-strong',
                  )}
                >
                  {active && (
                    <m.span
                      layoutId={indicatorId}
                      transition={spring.ui}
                      className="absolute inset-0 -z-10 rounded-pill bg-surface-2"
                    />
                  )}
                  {t(navLabelKey(id))}
                </SiteLink>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <LangSwitch />
              <ThemeToggle />
              <SiteLink to={sectionHref(locale, 'contact')} className={buttonClasses({})}>
                {t('nav.contact')}
              </SiteLink>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t('nav.openMenu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-pill border border-line-strong bg-surface-1 text-strong pressable hover:border-accent-text hover:text-accent-text lg:hidden"
            >
              <Menu size={20} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} current={current} />
    </>
  )
}
