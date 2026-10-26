import { useLayoutEffect, useRef, useState } from "react";
import SectionTitle from "../../components/SectionTitle/SectionTitle";
import ProyectoCard from "../../components/ProyectoCard/ProyectoCard";
import ProyectoModal from "../../components/ProyectoModal/ProyectoModal";
import SeccionAnimada from "../../components/SeccionAnimada/SeccionAnimada";
import { proyectos } from "../../data/proyectos";
import "./Proyectos.css";

const ANCHO_SLOT_POR_DEFECTO = 560;
const PASO_RATIO = 0.62;
const ROTACION_MAXIMA = 32;
const PROFUNDIDAD_PASO = 170;
const ESCALA_PASO = 0.18;
const OPACIDAD_PASO = 0.4;
const UMBRAL_ARRASTRE_RATIO = 0.3;
const UMBRAL_CLICK_PX = 5;
const MARGEN_ALTURA_VIEWPORT = 40;

function Proyectos() {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [indiceActivo, setIndiceActivo] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [arrastreX, setArrastreX] = useState(0);
  const [alturaViewport, setAlturaViewport] = useState(null);
  const [paso, setPaso] = useState(ANCHO_SLOT_POR_DEFECTO * PASO_RATIO);

  const slotRefs = useRef([]);
  const inicioXRef = useRef(0);
  const arrastreSignificativoRef = useRef(false);
  const pointerIdRef = useRef(0);

  // La altura del viewport se ajusta a la card activa (en vez de un valor fijo por
  // breakpoint) porque la descripción de cada proyecto tiene distinto largo y en
  // pantallas angostas una card podía quedar más alta que el contenedor y recortarse.
  useLayoutEffect(() => {
    const elementoActivo = slotRefs.current[indiceActivo];
    if (!elementoActivo) return;

    function actualizarAltura() {
      setAlturaViewport(elementoActivo.offsetHeight + MARGEN_ALTURA_VIEWPORT);
      setPaso(
        (slotRefs.current[0]?.offsetWidth || ANCHO_SLOT_POR_DEFECTO) * PASO_RATIO
      );
    }

    actualizarAltura();

    const observador = new ResizeObserver(actualizarAltura);
    observador.observe(elementoActivo);

    return () => observador.disconnect();
  }, [indiceActivo]);

  function abrirModalProyecto(proyecto) {
    setProyectoSeleccionado(proyecto);
  }

  function cerrarModalProyecto() {
    setProyectoSeleccionado(null);
  }

  function irA(indice) {
    setIndiceActivo(Math.min(Math.max(indice, 0), proyectos.length - 1));
  }

  function manejarPointerDown(evento) {
    if (evento.button !== 0) return;
    inicioXRef.current = evento.clientX;
    arrastreSignificativoRef.current = false;
    pointerIdRef.current = evento.pointerId;
    setArrastrando(true);
    setArrastreX(0);
  }

  function manejarPointerMove(evento) {
    if (!arrastrando) return;
    const delta = evento.clientX - inicioXRef.current;

    // La captura del puntero se activa recién cuando el gesto es realmente un arrastre
    // (no en el pointerdown): capturar antes rompe el click de los botones internos,
    // porque el navegador redirige también el evento "click" al elemento capturado.
    if (!arrastreSignificativoRef.current && Math.abs(delta) > UMBRAL_CLICK_PX) {
      arrastreSignificativoRef.current = true;
      try {
        evento.currentTarget.setPointerCapture(pointerIdRef.current);
      } catch {
        // Algunos navegadores rechazan capturar punteros sintéticos o inactivos.
      }
    }

    setArrastreX(delta);
  }

  function manejarPointerUp() {
    if (!arrastrando) return;
    const umbral = paso * UMBRAL_ARRASTRE_RATIO;

    if (arrastreX < -umbral) {
      irA(indiceActivo + 1);
    } else if (arrastreX > umbral) {
      irA(indiceActivo - 1);
    }

    setArrastrando(false);
    setArrastreX(0);
  }

  function manejarClickSlot(indice) {
    if (arrastreSignificativoRef.current) {
      arrastreSignificativoRef.current = false;
      return;
    }
    if (indice !== indiceActivo) {
      irA(indice);
    }
  }

  return (
    <SeccionAnimada id="proyectos" className="proyectos">
      <SectionTitle
        titulo="Trabajos para mostrar mi evolución"
        descripcion="Una selección de proyectos académicos, personales y prácticos orientados a resolver problemas reales."
      />

      <div className="proyectos__carrusel">
        <button
          type="button"
          className="proyectos__flecha proyectos__flecha--prev"
          onClick={() => irA(indiceActivo - 1)}
          disabled={indiceActivo === 0}
          aria-label="Proyecto anterior"
        >
          ‹
        </button>

        <div
          className={`proyectos__viewport${arrastrando ? " proyectos__viewport--arrastrando" : ""}`}
          style={{ height: alturaViewport ? `${alturaViewport}px` : undefined }}
          onPointerDown={manejarPointerDown}
          onPointerMove={manejarPointerMove}
          onPointerUp={manejarPointerUp}
          onPointerLeave={manejarPointerUp}
          onPointerCancel={manejarPointerUp}
        >
          {proyectos.map((proyecto, indice) => {
            const offset = indice - indiceActivo;
            const offsetEfectivo = offset + (arrastrando ? arrastreX / paso : 0);
            const absEfectivo = Math.abs(offsetEfectivo);
            const esActivo = offset === 0;

            const desplazamiento = offset * paso + (arrastrando ? arrastreX : 0);
            const rotacion = offsetEfectivo * -ROTACION_MAXIMA;
            const profundidad = -absEfectivo * PROFUNDIDAD_PASO;
            const escala = Math.max(1 - absEfectivo * ESCALA_PASO, 0.5);
            const opacidad = Math.max(1 - absEfectivo * OPACIDAD_PASO, 0);

            return (
              <div
                key={proyecto.id}
                ref={(el) => {
                  slotRefs.current[indice] = el;
                }}
                className={`proyectos__slot${esActivo ? " proyectos__slot--activo" : ""}`}
                style={{
                  transform: `translate(-50%, -50%) translateX(${desplazamiento}px) translateZ(${profundidad}px) rotateY(${rotacion}deg) scale(${escala})`,
                  opacity: opacidad,
                  zIndex: 100 - Math.round(absEfectivo * 10),
                  pointerEvents: Math.abs(offset) > 3 ? "none" : "auto",
                }}
                onClick={() => manejarClickSlot(indice)}
              >
                <ProyectoCard proyecto={proyecto} abrirModalProyecto={abrirModalProyecto} />
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="proyectos__flecha proyectos__flecha--next"
          onClick={() => irA(indiceActivo + 1)}
          disabled={indiceActivo === proyectos.length - 1}
          aria-label="Siguiente proyecto"
        >
          ›
        </button>
      </div>

      <div className="proyectos__dots">
        {proyectos.map((proyecto, indice) => (
          <button
            key={proyecto.id}
            type="button"
            className={`proyectos__dot${indice === indiceActivo ? " proyectos__dot--activo" : ""}`}
            onClick={() => irA(indice)}
            aria-label={`Ir al proyecto ${indice + 1}: ${proyecto.titulo}`}
            aria-current={indice === indiceActivo}
          />
        ))}
      </div>

      <ProyectoModal
        proyectoSeleccionado={proyectoSeleccionado}
        cerrarModal={cerrarModalProyecto}
      />
    </SeccionAnimada>
  );
}

export default Proyectos;