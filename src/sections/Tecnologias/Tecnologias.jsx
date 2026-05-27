import SectionTitle from "../../components/SectionTitle/SectionTitle";
import { tecnologias } from "../../data/tecnologias";
import "./Tecnologias.css";

function Tecnologias() {
  return (
    <section id="tecnologias" className="tecnologias">
      <SectionTitle
        etiqueta="Stack"
        titulo="Tecnologías que estoy usando"
        descripcion="Herramientas y lenguajes que uso para crear interfaces, APIs, bases de datos y proyectos completos."
      />

      <div className="tecnologias__lista">
        {tecnologias.map((tecnologia) => (
          <span key={tecnologia}>{tecnologia}</span>
        ))}
      </div>
    </section>
  );
}

export default Tecnologias;