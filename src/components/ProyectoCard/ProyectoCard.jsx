import "./ProyectoCard.css";

function ProyectoCard({ proyecto, abrirModalProyecto }) {
  const enlaceCodigoDisponible = proyecto.codigo && proyecto.codigo !== "#";

  return (
    <article className={`proyecto-card proyecto-card--${proyecto.color || "verde"}`}>
      <div className="proyecto-card__decoracion">
        <span className="proyecto-card__numero">
          {String(proyecto.id).padStart(2, "0")}
        </span>
      </div>

      <div className="proyecto-card__barra">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="proyecto-card__contenido">
        <div className="proyecto-card__header">
          <span>{proyecto.categoria}</span>

          {proyecto.destacado && (
            <span className="proyecto-card__destacado">
              Destacado
            </span>
          )}
        </div>

        <h3>{proyecto.titulo}</h3>

        <p>{proyecto.descripcionCorta}</p>

        <ul className="proyecto-card__tecnologias">
          {proyecto.tecnologias.slice(0, 5).map((tecnologia) => (
            <li key={tecnologia}>{tecnologia}</li>
          ))}
        </ul>

        <div className="proyecto-card__acciones">
          <button type="button" onClick={() => abrirModalProyecto(proyecto)}>
            Saber más
          </button>

          {enlaceCodigoDisponible ? (
            <a href={proyecto.codigo} target="_blank" rel="noreferrer">
              Ver código
            </a>
          ) : (
            <span className="proyecto-card__codigo-pendiente">
              Código pendiente
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProyectoCard;