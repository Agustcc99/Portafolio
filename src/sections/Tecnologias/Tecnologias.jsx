import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIAS_TECNICAS, TECNOLOGIAS_INFO } from "../../content/legacy";
import TechnologyModal from "./TechnologyModal";
import "./Tecnologias.css";

const RETRASO_PULSO_MS = 2000;

const COLOR_VAR_POR_NOMBRE = {
  verde: "var(--accent-2)",
  celeste: "var(--accent-4)",
  violeta: "var(--accent)",
  magenta: "var(--accent-3)",
};

// Orden de lectura de las tarjetas: en escritorio sigue la grilla 2x2
// (fila por fila); en móvil sigue el flujo real interfaz -> ... -> entrega,
// que en una sola columna coincide con el orden visual de arriba hacia abajo.
const ORDEN_TARJETAS_ESCRITORIO = ["interfaz", "logica", "entrega", "datos"];
const ORDEN_TARJETAS_MOVIL = ["interfaz", "logica", "datos", "entrega"];

function Tecnologias() {
  const seccionRef = useRef(null);
  const disparadorRef = useRef(null);

  const [entrada, setEntrada] = useState(false);
  const [pulso, setPulso] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [esMovil, setEsMovil] = useState(
    () => window.matchMedia("(max-width: 640px)").matches
  );

  const [categoriaHover, setCategoriaHover] = useState(null);
  const [techSeleccionado, setTechSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const categoriasPorId = useMemo(
    () => Object.fromEntries(CATEGORIAS_TECNICAS.map((c) => [c.id, c])),
    []
  );

  useEffect(() => {
    const seccion = seccionRef.current;
    let pulsoTimeout = null;

    const observer = new IntersectionObserver(
      ([entrada2]) => {
        if (entrada2.isIntersecting) {
          setEntrada(true);
          observer.unobserve(entrada2.target);
          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            pulsoTimeout = window.setTimeout(() => setPulso(true), RETRASO_PULSO_MS);
          }
        }
      },
      { threshold: 0.2 }
    );

    if (seccion) observer.observe(seccion);

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    function alCambiarReducedMotion(evento) {
      setReducedMotion(evento.matches);
    }
    reducedMotionQuery.addEventListener("change", alCambiarReducedMotion);

    const movilQuery = window.matchMedia("(max-width: 640px)");
    function alCambiarMovil(evento) {
      setEsMovil(evento.matches);
    }
    movilQuery.addEventListener("change", alCambiarMovil);

    return () => {
      observer.disconnect();
      if (pulsoTimeout) window.clearTimeout(pulsoTimeout);
      reducedMotionQuery.removeEventListener("change", alCambiarReducedMotion);
      movilQuery.removeEventListener("change", alCambiarMovil);
    };
  }, []);

  function abrirTecnologia(slug, elementoDisparador) {
    disparadorRef.current = elementoDisparador;
    setTechSeleccionado(slug);
    requestAnimationFrame(() => setModalAbierto(true));
  }

  function solicitarCierreModal() {
    setModalAbierto(false);
  }

  function alTerminarCierreModal() {
    setTechSeleccionado(null);
    disparadorRef.current?.focus();
    disparadorRef.current = null;
  }

  function conectorActivo(idA, idB) {
    return categoriaHover === idA || categoriaHover === idB;
  }

  const clasesSeccion = [
    "tecnologias",
    entrada && "tecnologias--entrada",
    pulso && "tecnologias--pulso",
    reducedMotion && "tecnologias--sin-movimiento",
  ]
    .filter(Boolean)
    .join(" ");

  const orden = esMovil ? ORDEN_TARJETAS_MOVIL : ORDEN_TARJETAS_ESCRITORIO;

  const categoriaSeleccionada = techSeleccionado
    ? CATEGORIAS_TECNICAS.find((categoria) =>
        categoria.tecnologias.includes(techSeleccionado)
      )
    : null;

  return (
    <section id="tech" className={clasesSeccion} ref={seccionRef}>
      <div className="tecnologias__intro">
        <h2>Cómo construyo una aplicación completa</h2>
        <p className="tecnologias__descripcion">
          Herramientas y tecnologías que conecto para desarrollar interfaces,
          APIs, bases de datos y sistemas utilizables.
        </p>
        <p className="tecnologias__resumen">
          Hace 2 años combino estas herramientas para construir aplicaciones
          completas, de la interfaz a la base de datos.
        </p>
      </div>

      <div className="tecnologias__mapa" aria-label="Mapa de arquitectura técnica">
        {orden.map((id) => {
          const categoria = categoriasPorId[id];

          return (
            <article
              key={categoria.id}
              className={`tecnologias__tarjeta tecnologias__tarjeta--${categoria.color} tecnologias__tarjeta--${categoria.id}`}
              onMouseEnter={() => setCategoriaHover(categoria.id)}
              onMouseLeave={() =>
                setCategoriaHover((actual) => (actual === categoria.id ? null : actual))
              }
              onFocus={() => setCategoriaHover(categoria.id)}
              onBlur={() =>
                setCategoriaHover((actual) => (actual === categoria.id ? null : actual))
              }
            >
              <span className="tecnologias__tarjeta-numero">{categoria.numero}</span>
              <h3>{categoria.nombre}</h3>
              <p>{categoria.descripcion}</p>

              <ul className="tecnologias__chips">
                {categoria.tecnologias.map((slug) => (
                  <li key={slug}>
                    <button
                      type="button"
                      className="tecnologias__chip"
                      onClick={(evento) => abrirTecnologia(slug, evento.currentTarget)}
                    >
                      {TECNOLOGIAS_INFO[slug].nombre}
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}

        <div
          className={`tecnologias__conector tecnologias__conector--top${
            conectorActivo("interfaz", "logica") ? " tecnologias__conector--activo" : ""
          }`}
          style={{
            "--color-a": COLOR_VAR_POR_NOMBRE[categoriasPorId.interfaz.color],
            "--color-b": COLOR_VAR_POR_NOMBRE[categoriasPorId.logica.color],
          }}
          aria-hidden="true"
        />
        <div
          className={`tecnologias__conector tecnologias__conector--right${
            conectorActivo("logica", "datos") ? " tecnologias__conector--activo" : ""
          }`}
          style={{
            "--color-a": COLOR_VAR_POR_NOMBRE[categoriasPorId.logica.color],
            "--color-b": COLOR_VAR_POR_NOMBRE[categoriasPorId.datos.color],
          }}
          aria-hidden="true"
        />
        <div
          className={`tecnologias__conector tecnologias__conector--bottom${
            conectorActivo("datos", "entrega") ? " tecnologias__conector--activo" : ""
          }`}
          style={{
            "--color-a": COLOR_VAR_POR_NOMBRE[categoriasPorId.datos.color],
            "--color-b": COLOR_VAR_POR_NOMBRE[categoriasPorId.entrega.color],
          }}
          aria-hidden="true"
        />
      </div>

      {techSeleccionado && (
        <TechnologyModal
          slug={techSeleccionado}
          categoriaColor={categoriaSeleccionada?.color ?? "verde"}
          abierto={modalAbierto}
          reducedMotion={reducedMotion}
          onCerrar={solicitarCierreModal}
          onCerradoCompleto={alTerminarCierreModal}
        />
      )}
    </section>
  );
}

export default Tecnologias;
