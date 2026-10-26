import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Reveal } from './Reveal'
import { SplitHeading } from './SplitHeading'

interface SectionHeadingProps {
  /** Número de sección en mono (`01`). */
  index: string
  /** Etiqueta en mono (`Sobre mí`). */
  label: string
  /** Título; una o dos palabras pueden ir en `<em>` (serif itálica, color de acento). */
  title: ReactNode
  description?: ReactNode
  className?: string
}

/** Cabecera común de sección: etiqueta numerada en mono + título display con máscara por línea. */
export function SectionHeading({ index, label, title, description, className }: SectionHeadingProps) {
  return (
    <header className={cn('mb-12 max-w-[56rem] md:mb-16', className)}>
      <Reveal
        as="p"
        className="mb-5 flex items-center gap-3 font-mono text-label uppercase tracking-[0.12em] text-accent-text"
      >
        <span>{index}</span>
        <span aria-hidden className="h-px w-8 bg-accent-text/50" />
        <span className="text-muted">{label}</span>
      </Reveal>
      <SplitHeading as="h2" className="text-h2">
        {title}
      </SplitHeading>
      {description && (
        <Reveal as="p" delay={0.15} className="mt-6 max-w-[62ch]">
          {description}
        </Reveal>
      )}
    </header>
  )
}
