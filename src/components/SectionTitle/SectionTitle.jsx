import "./SectionTitle.css";

function SectionTitle({ etiqueta, titulo, descripcion }) {
  return (
    <div className="section-title">
      <span className="section-title__tag">{etiqueta}</span>
      <h2>{titulo}</h2>
      {descripcion && <p>{descripcion}</p>}
    </div>
  );
}

export default SectionTitle;