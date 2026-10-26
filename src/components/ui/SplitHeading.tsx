import { useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useGsapContext } from '../../lib/gsap'
import { cn } from '../../lib/cn'

interface SplitHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  children: ReactNode
  /** `scroll`: se anima al entrar en pantalla. `mount`: apenas se parte el texto (hero). */
  trigger?: 'scroll' | 'mount'
  /** Segundos de espera antes de empezar. */
  delay?: number
  /** Segundos entre palabras. */
  stagger?: number
  /** Si se pasa, la animación espera a que esta promesa se resuelva (p. ej. `introDone`). */
  waitFor?: Promise<unknown>
}

/**
 * Título que entra palabra por palabra detrás de una máscara por línea (GSAP SplitText).
 * Se vuelve a partir al cambiar de idioma o de ancho (`autoSplit`). Sin GSAP o con movimiento
 * reducido el texto se muestra tal cual.
 */
export function SplitHeading({
  as: Tag = 'h2',
  className,
  children,
  trigger = 'scroll',
  delay = 0,
  stagger = 0.06,
  waitFor,
}: SplitHeadingProps) {
  const { i18n } = useTranslation()
  const reduced = useReducedMotion()
  const outer = useRef<HTMLHeadingElement>(null)
  const inner = useRef<HTMLSpanElement>(null)

  const show = () => outer.current?.removeAttribute('data-split')

  useGsapContext(
    ({ gsap, SplitText }) => {
      const heading = outer.current
      const target = inner.current
      if (!heading || !target) return

      const split = SplitText.create(target, {
        type: 'lines,words',
        mask: 'lines',
        autoSplit: true,
        aria: 'auto',
        onSplit: (self) => {
          const tween = gsap.from(self.words, {
            yPercent: 110,
            duration: 0.9,
            ease: 'expo.out',
            stagger,
            delay,
            paused: Boolean(waitFor),
            scrollTrigger:
              trigger === 'scroll' ? { trigger: heading, start: 'top 88%', once: true } : undefined,
          })
          show()
          void waitFor?.then(() => tween.play())
          return tween
        },
      })

      return () => {
        split.revert()
        // Al volver a ocultar hasta el próximo corte evitamos ver el texto crudo un instante.
        heading.setAttribute('data-split', 'pending')
      }
    },
    [reduced, trigger, delay, stagger, waitFor, i18n.language],
    { enabled: !reduced, onError: show },
  )

  return (
    <Tag
      ref={outer}
      data-split={reduced ? undefined : 'pending'}
      className={cn('data-[split=pending]:invisible', className)}
    >
      {/* La clave fuerza un <span> nuevo al cambiar de idioma: SplitText modifica este nodo. */}
      <span key={i18n.language} ref={inner} className="block">
        {children}
      </span>
    </Tag>
  )
}
