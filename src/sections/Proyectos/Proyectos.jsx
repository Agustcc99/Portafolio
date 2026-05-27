import { useState } from "react";
import SectionTitle from "../../components/SectionTitle/SectionTitle";
import ProyectoCard from "../../components/ProyectoCard/ProyectoCard";
import ProyectoModal from "../../components/ProyectoModal/ProyectoModal";
import SeccionAnimada from "../../components/SeccionAnimada/SeccionAnimada";
import { proyectos } from "../../data/proyectos";
import "./Proyectos.css";

function Proyectos() {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  function abrirModalProyecto(proyecto) {
    setProyectoSeleccionado(proyecto);
  }

  function cerrarModalProyecto() {
    setProyectoSeleccionado(null);
  }

  return (
    <SeccionAnimada id="proyectos" className="proyectos">
      <SectionTitle
        etiqueta="Proyectos"
        titulo="Trabajos para mostrar mi evolución"
        descripcion="Una selección de proyectos académicos, personales y prácticos orientados a resolver problemas reales."
      />

      <div className="proyectos__grid">
        {proyectos.map((proyecto) => (
          <ProyectoCard
            key={proyecto.id}
            proyecto={proyecto}
            abrirModalProyecto={abrirModalProyecto}
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