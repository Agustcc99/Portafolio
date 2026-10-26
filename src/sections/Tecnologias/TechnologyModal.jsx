import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NIVELES_TECNICOS, TECNOLOGIAS_INFO } from "../../content/legacy";
import { proyectos } from "../../content/legacy";
import "./TechnologyModal.css";

const DURACION_CIERRE_MS = 220;
const SELECTOR_FOCOSEABLES =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function nombreDeProyecto(entrada) {
  if (entrada === "portfolio") return "Este portfolio (Agustín.dev)";
  return proyectos.find((proyecto) => proyecto.id === entrada)?.titulo ?? null;
}

function TechnologyModal({
  slug,
  categoriaColor,
  abierto,
  reducedMotion,
  onCerrar,
  onCerradoCompleto,
}) {
  const panelRef = useRef(null);
  const cerrarRef = useRef(null);

  const info = TECNOLOGIAS_INFO[slug];
  const nivel = NIVELES_TECNICOS[info.nivel];
  const nombresProyectos = info.proyectos.map(nombreDeProyecto).filter(Boolean);

  // Bloquea el scroll del body mientras el modal está abierto y compensa el
  // ancho de la scrollbar para no producir saltos horizontales al ocultarla.
  useEffect(() => {
    const overflowPrevio = document.body.style.overflow;
    const paddingPrevio = document.body.style.paddingRight;
    const anchoScrollbar = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (anchoScrollbar > 0) {
      document.body.style.paddingRight = `${anchoScrollbar}px`;
    }

    return () => {
      document.body.style.overflow = overflowPrevio;
      document.body.style.paddingRight = paddingPrevio;
    };
  }, []);

  useEffect(() => {
    cerrarRef.current?.focus();
  }, []);

  // Escape cierra el modal; Tab / Shift+Tab quedan atrapados dentro del panel.
  useEffect(() => {
    function alPresionarTecla(evento) {
      if (evento.key === "Escape") {
        evento.stopPropagation();
        onCerrar();
        return;
      }

      if (evento.key !== "Tab" || !panelRef.current) return;

      const focoseables = panelRef.current.querySelectorAll(SELECTOR_FOCOSEABLES);
      if (focoseables.length === 0) return;

      const primero = focoseables[0];
      const ultimo = focoseables[focoseables.length - 1];

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", alPresionarTecla);
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [onCerrar]);

  // Al pedirse el cierre se espera a que termine la transición de salida
  // antes de desmontar, para no cortar la animación a mitad de camino.
  useEffect(() => {
    if (abierto) return;

    if (reducedMotion) {
      onCerradoCompleto();
      return;
    }

    const id = window.setTimeout(onCerradoCompleto, DURACION_CIERRE_MS);
    return () => window.clearTimeout(id);
  }, [abierto, reducedMotion, onCerradoCompleto]);

  return createPortal(
    <div
      className={`tech-modal${abierto ? " tech-modal--abierto" : ""}`}
      onClick={onCerrar}
    >
      <div
        className={`tech-modal__panel tech-modal__panel--${categoriaColor}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tech-modal-titulo"
        ref={panelRef}
        onClick={(evento) => evento.stopPropagation()}
      >
        <button
          type="button"
          className="tech-modal__cerrar"
          onClick={onCerrar}
          aria-label="Cerrar detalle de tecnología"
          ref={cerrarRef}
        >
          ×
        </button>

        <span className="tech-modal__nivel">{nivel.etiqueta}</span>
        <h2 id="tech-modal-titulo">{info.nombre}</h2>

        {info.usadoPara.length > 0 && (
          <section className="tech-modal__bloque">
            <h3>Utilizado para</h3>
            <ul>
              {info.usadoPara.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {info.funcionalidades.length > 0 && (
          <section className="tech-modal__bloque">
            <h3>Funcionalidades desarrolladas</h3>
            <ul>
              {info.funcionalidades.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {nombresProyectos.length > 0 && (
          <section className="tech-modal__bloque">
            <h3>Proyectos</h3>
            <ul>
              {nombresProyectos.map((titulo) => (
                <li key={titulo}>{titulo}</li>
              ))}
            </ul>
          </section>
        )}

        <button type="button" className="tech-modal__cerrar-pie" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>,
    document.body
  );
}

export default TechnologyModal;
