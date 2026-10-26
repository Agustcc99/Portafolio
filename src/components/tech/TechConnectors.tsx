import { cn } from '../../lib/cn'

export type ConnectorId = 'top' | 'right' | 'bottom'

interface TechConnectorProps {
  id: ConnectorId
  /** Trazo vertical (móvil, y siempre el conector derecho); si no, horizontal. */
  vertical: boolean
  /** Sentido del trazo: de la categoría de origen a la de destino. */
  reverse?: boolean
  drawn: boolean
  active: boolean
  pulse: boolean
  /** Segundos de espera antes de dibujarse / pulsar (escalona los tres conectores). */
  delay: number
}

const SIZE = 64
const MID = SIZE / 2

/**
 * Conector SVG entre dos categorías del mapa. Se dibuja una sola vez al entrar en pantalla
 * (`stroke-dashoffset` con `pathLength=1`), se ilumina con hover/foco de cualquiera de sus dos
 * extremos y recibe un único pulso poco después de dibujarse. El `viewBox` es de 64 × 64 y se
 * centra en la celda de la grilla, así el trazo nunca se deforma.
 */
export function TechConnector({ id, vertical, reverse = false, drawn, active, pulse, delay }: TechConnectorProps) {
  const [from, to] = reverse ? [SIZE, 0] : [0, SIZE]
  const d = vertical ? `M${MID} ${from} V${to}` : `M${from} ${MID} H${to}`
  const dot = vertical ? { cx: MID, cy: to } : { cx: to, cy: MID }

  return (
    <div className={cn('tech-map__gap', `tech-map__gap--${id}`)} aria-hidden>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="tech-connector"
        data-drawn={drawn || undefined}
        data-active={active || undefined}
        data-pulse={pulse || undefined}
        style={{ '--delay': `${delay}s` } as React.CSSProperties}
        focusable="false"
      >
        <path d={d} pathLength={1} className="tech-connector__line" />
        <path d={d} pathLength={1} className="tech-connector__glow" />
        <circle {...dot} r={3} className="tech-connector__dot" />
      </svg>
    </div>
  )
}
