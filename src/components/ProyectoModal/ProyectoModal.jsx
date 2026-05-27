import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./ProyectoModal.css";

function GaleriaProyecto({ proyectoSeleccionado }) {
  const [indiceImagenActual, setIndiceImagenActual] = useState(0);

  const imagenesDelProyecto =
    proyectoSeleccionado.imagenes?.length > 0
      ? proyectoSeleccionado.imagenes
      : [proyectoSeleccionado.imagen];

  const imagenActual = imagenesDelProyecto[indiceImagenActual];

  function mostrarImagenAnterior() {
    const nuevoIndice =
      indiceImagenActual === 0
        ? imagenesDelProyecto.length - 1
        : indiceImagenActual - 1;

    setIndiceImagenActual(nuevoIndice);
  }

  function mostrarImagenSiguiente() {
    const nuevoIndice =
      indiceImagenActual === imagenesDelProyecto.length - 1
        ? 0
        : indiceImagenActual + 1;

    setIndiceImagenActual(nuevoIndice);
  }

  function seleccionarImagen(indiceSeleccionado) {
    setIndiceImagenActual(indiceSeleccionado);
  }

  return (
    <div className="modal-proyecto__galeria">
      <div className="modal-proyecto__imagen-principal">
        {imagenActual ? (
          <img
            src={imagenActual}
            alt={`Captura ${indiceImagenActual + 1} del proyecto ${proyectoSeleccionado.titulo}`}
          />
        ) : (
          <div className="modal-proyecto__sin-imagen">
            Vista previa próximamente
          </div>
        )}

        {imagenesDelProyecto.length > 1 && (
          <>
            <button
              type="button"
              className="modal-proyecto__flecha modal-proyecto__flecha--izquierda"
              onClick={mostrarImagenAnterior}
              aria-label="Ver imagen anterior"
            >
              ‹
            </button>

            <button
              type="button"
              className="modal-proyecto__flecha modal-proyecto__flecha--derecha"
              onClick={mostrarImagenSiguiente}
              aria-label="Ver imagen siguiente"
            >
              ›
            </button>

            <span className="modal-proyecto__contador">
              {indiceImagenActual + 1} / {imagenesDelProyecto.length}
            </span>
          </>
        )}
      </div>

      {imagenesDelProyecto.length > 1 && (
        <div className="modal-proyecto__miniaturas">
          {imagenesDelProyecto.map((imagenProyecto, indiceImagen) => (
            <button
              key={imagenProyecto}
              type="button"
              className={`modal-proyecto__miniatura ${
                indiceImagenActual === indiceImagen
                  ? "modal-proyecto__miniatura--activa"
                  : ""
              }`}
              onClick={() => seleccionarImagen(indiceImagen)}
              aria-label={`Ver captura ${indiceImagen + 1}`}
            >
              <img
                src={imagenProyecto}
                alt={`Miniatura ${indiceImagen + 1} del proyecto ${proyectoSeleccionado.titulo}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProyectoModal({ proyectoSeleccionado, cerrarModal }) {
  useEffect(() => {
    if (!proyectoSeleccionado) {
      return;
    }

    document.body.style.overflow = "hidden";

    function cerrarModalConEscape(evento) {
      if (evento.key === "Escape") {
        cerrarModal();
      }
    }

    document.addEventListener("keydown", cerrarModalConEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", cerrarModalConEscape);
    };
  }, [proyectoSeleccionado, cerrarModal]);

  if (!proyectoSeleccionado) {
    return null;
  }

  

  const enlaceCodigoDisponible =
    proyectoSeleccionado.codigo && proyectoSeleccionado.codigo !== "#";

  return createPortal(
    <div className="modal-proyecto" onClick={cerrarModal}>
      <article
        className={`modal-proyecto__contenido modal-proyecto__contenido--${
          proyectoSeleccionado.color || "verde"
        }`}
        onClick={(evento) => evento.stopPropagation()}
      >
        <button
          className="modal-proyecto__cerrar"
          type="button"
          onClick={cerrarModal}
          aria-label="Cerrar modal"
        >
          ×
        </button>

        <GaleriaProyecto
          key={proyectoSeleccionado.id}
          proyectoSeleccionado={proyectoSeleccionado}
        />

        <div className="modal-proyecto__info">
          <div className="modal-proyecto__etiquetas">
            <span className="modal-proyecto__categoria">
              {proyectoSeleccionado.categoria}
            </span>

            {proyectoSeleccionado.destacado && (
              <span className="modal-proyecto__destacado">
                Proyecto destacado
              </span>
            )}
          </div>

          <h2>{proyectoSeleccionado.titulo}</h2>

          <p className="modal-proyecto__descripcion">
            {proyectoSeleccionado.descripcionLarga}
          </p>

          <section className="modal-proyecto__bloque">
            <h3>Objetivo</h3>
            <p>{proyectoSeleccionado.objetivo}</p>
          </section>

          <section className="modal-proyecto__bloque">
            <h3>Tecnologías utilizadas</h3>

            <div className="modal-proyecto__tecnologias">
              {proyectoSeleccionado.tecnologias.map((tecnologia) => (
                <span key={tecnologia}>{tecnologia}</span>
              ))}
            </div>
          </section>

          <section className="modal-proyecto__grid">
            <div className="modal-proyecto__bloque">
              <h3>Funcionalidades</h3>
              <ul>
                {proyectoSeleccionado.funcionalidades.map((funcionalidad) => (
                  <li key={funcionalidad}>{funcionalidad}</li>
                ))}
              </ul>
            </div>

            <div className="modal-proyecto__bloque">
              <h3>Aprendizajes</h3>
              <ul>
                {proyectoSeleccionado.aprendizajes.map((aprendizaje) => (
                  <li key={aprendizaje}>{aprendizaje}</li>
                ))}
              </ul>
            </div>
          </section>

          <div className="modal-proyecto__acciones">
  {enlaceCodigoDisponible && (
    <a
      href={proyectoSeleccionado.codigo}
      target="_blank"
      rel="noreferrer"
    >
      Ver código
    </a>
  )}
</div>
        </div>
      </article>
    </div>,
    document.body
  );
}

export default ProyectoModal;