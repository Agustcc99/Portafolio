import './SectionTitle.css'

interface SectionTitleProps {
  etiqueta?: string
  titulo: string
  descripcion?: string
}

function SectionTitle({ etiqueta, titulo, descripcion }: SectionTitleProps) {
  return (
    <div className="section-title">
      {etiqueta && <span className="section-title__tag">{etiqueta}</span>}
      <h2>{titulo}</h2>
      {descripcion && <p>{descripcion}</p>}
    </div>
  )
}

export default SectionTitle
