import { useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { InteractiveHeroGrid } from '../../components/hero/InteractiveHeroGrid'
import { SiteLink } from '../../components/layout/SiteLink'
import { buttonClasses } from '../../components/ui/buttonClasses'
import { Container } from '../../components/ui/Container'
import { MagneticButton } from '../../components/ui/MagneticButton'
import { SplitHeading } from '../../components/ui/SplitHeading'
import { projects } from '../../content/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useGsapContext } from '../../lib/gsap'
import { introRevealing } from '../../lib/intro'

/**
 * Hero a sangre completa. Coreografía de entrada (GSAP), que arranca cuando la intro retira la cortina:
 * chip → H1 por palabras (SplitHeading) → párrafo → CTAs → datos → indicador de scroll,
 * mientras la grilla se "enciende" desde el centro. Con movimiento reducido todo aparece ya
 * dibujado. Si GSAP no carga, `onError` retira el estado oculto y se ve el hero completo.
 */
export function Hero() {
  const { t } = useTranslation('home')
  const reduced = useReducedMotion()
  const root = useRef<HTMLElement>(null)

  const reveal = () => root.current?.removeAttribute('data-hero')

  useGsapContext(
    ({ gsap }) => {
      const hero = root.current
      if (!hero) return
      const item = (name: string) => hero.querySelector(`[data-hero-item="${name}"]`)
      const grid = hero.querySelector('.interactive-hero-grid')

      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
      timeline
        .fromTo(item('status'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 0)
        .fromTo(grid, { '--reveal': 0 }, { '--reveal': 1, duration: 1.8, ease: 'power2.out' }, 0.1)
        .fromTo(item('text'), { y: 18 }, { y: 0, duration: 0.9 }, 0.2)
        .fromTo(item('cta'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9 }, 0.45)
        .fromTo(item('stats'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9 }, 0.55)
        .fromTo(item('scroll'), { opacity: 0 }, { opacity: 1, duration: 1 }, 0.9)

      reveal() // los `fromTo` ya fijaron el estado inicial inline: se puede quitar el ocultado por CSS
      void introRevealing.then(() => timeline.play())
    },
    [reduced],
    { scope: root, enabled: !reduced, onError: reveal },
  )

  return (
    <section
      id="home"
      ref={root}
      data-hero={reduced ? undefined : 'pending'}
      className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden pt-32 pb-28"
    >
      <InteractiveHeroGrid />

      <Container className="relative z-10">
        <div
          data-hero-item="status"
          className="inline-flex items-center gap-2.5 rounded-pill border border-line-strong bg-surface-1/70 py-1.5 pr-4 pl-3 font-mono text-label uppercase tracking-[0.12em] text-strong backdrop-blur"
        >
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-text opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent-text" />
          </span>
          {t('hero.status')}
        </div>

        <SplitHeading
          as="h1"
          trigger="mount"
          delay={0.15}
          waitFor={introRevealing}
          className="mt-8 max-w-[14ch] text-display"
        >
          <Trans
            t={t}
            i18nKey="hero.title"
            components={{ em: <em className="font-serif font-normal text-accent-text" /> }}
          />
        </SplitHeading>

        <p data-hero-item="text" className="mt-8 max-w-[52ch] text-body text-text">
          {t('hero.text')}
        </p>

        <div data-hero-item="cta" className="mt-10 flex flex-wrap items-center gap-3">
          <MagneticButton>
            <SiteLink to="#projects" className={buttonClasses({ size: 'lg' })}>
              {t('hero.ctaProjects')}
            </SiteLink>
          </MagneticButton>
          <SiteLink to="#contact" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
            {t('hero.ctaContact')}
          </SiteLink>
        </div>

        <ul
          data-hero-item="stats"
          aria-label={t('hero.statsLabel')}
          className="mt-14 flex flex-wrap gap-x-8 gap-y-2 font-mono text-label uppercase tracking-[0.12em] text-muted"
        >
          <li>{t('hero.statYears')}</li>
          <li>{t('hero.statProjects', { count: projects.length })}</li>
          <li>{t('hero.statStack')}</li>
        </ul>
      </Container>

      <SiteLink
        to="#about"
        data-hero-item="scroll"
        aria-label={t('hero.scrollTo')}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 font-mono text-label uppercase tracking-[0.12em] text-muted transition-colors duration-(--duration-base) hover:text-strong sm:flex"
      >
        {t('hero.scroll')}
        <span aria-hidden className="relative h-10 w-px overflow-hidden bg-line-strong">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-hint_1.8s_var(--ease-in-out-soft)_infinite] bg-accent-text" />
        </span>
      </SiteLink>
    </section>
  )
}
