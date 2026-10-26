import { useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { techCategories, type TechCategoryId } from '../../content/technologies'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { stagger } from '../../lib/motion'
import { TechConnector, type ConnectorId } from './TechConnectors'
import { TechDialog } from './TechDialog'
import { TechNode } from './TechNode'
import './TechMap.css'

/** Espera (ms) entre que el mapa entra en pantalla y su único pulso de conectores. */
const PULSE_DELAY_MS = 2000
/** Duración total del pulso antes de retirar la marca. */
const PULSE_DURATION_MS = 2600

/** Cada conector une dos categorías consecutivas del flujo; `reverse` es el sentido en escritorio. */
const connectors: ReadonlyArray<{ id: ConnectorId; between: [TechCategoryId, TechCategoryId]; reverse: boolean }> = [
  { id: 'top', between: ['interface', 'logic'], reverse: false },
  { id: 'right', between: ['logic', 'data'], reverse: false },
  { id: 'bottom', between: ['data', 'delivery'], reverse: true },
]

/**
 * Mapa de arquitectura técnica: cuatro categorías unidas por conectores que se dibujan al entrar
 * en pantalla. Los chips abren la ficha de cada tecnología (`TechDialog`).
 */
export function TechMap() {
  const reduced = useReducedMotion()
  const mobile = useMediaQuery('(max-width: 640px)')
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })

  const [hovered, setHovered] = useState<TechCategoryId | null>(null)
  const [pulse, setPulse] = useState(false)
  const [selected, setSelected] = useState<{ slug: string; open: boolean } | null>(null)

  useEffect(() => {
    if (!inView || reduced) return
    const start = window.setTimeout(() => setPulse(true), PULSE_DELAY_MS)
    const end = window.setTimeout(() => setPulse(false), PULSE_DELAY_MS + PULSE_DURATION_MS)
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(end)
    }
  }, [inView, reduced])

  return (
    <>
      <div ref={ref} className="tech-map">
        {techCategories.map((category, index) => (
          <TechNode
            key={category.id}
            category={category}
            delay={index * stagger.base}
            onHover={setHovered}
            onOpen={(slug) => setSelected({ slug, open: true })}
          />
        ))}
        {connectors.map(({ id, between, reverse }, index) => (
          <TechConnector
            key={id}
            id={id}
            vertical={mobile || id === 'right'}
            reverse={reverse && !mobile}
            drawn={inView}
            active={hovered !== null && between.includes(hovered)}
            pulse={pulse}
            delay={0.25 + index * 0.4}
          />
        ))}
      </div>

      {selected && (
        <TechDialog
          slug={selected.slug}
          open={selected.open}
          onClose={() => setSelected((state) => (state ? { ...state, open: false } : state))}
        />
      )}
    </>
  )
}
