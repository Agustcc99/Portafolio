import InteractiveHeroGrid from "../../components/InteractiveHeroGrid/InteractiveHeroGrid";
import { SiteLink } from "../../components/layout/SiteLink";
import "./Inicio.css";

function Inicio() {
  return (
    <section id="home" className="inicio">
      <InteractiveHeroGrid />

      <div className="inicio__contenido">
        <span className="inicio__badge">Desarrollador Web en formación</span>

        <h1>
          Creo interfaces <span>modernas</span>, funcionales y pensadas para
          <span> proyectos reales</span>.
        </h1>

        <p>
        Soy Agustín Tacconi, desarrollador web y gastronómico profesional.
        Me interesa crear soluciones útiles para problemas reales, combinando lógica, diseño y una forma de trabajo ordenada.
        </p>

        <div className="inicio__acciones">
          <SiteLink to="#projects" className="boton boton--principal">
            Ver proyectos
          </SiteLink>

          <SiteLink to="#contact" className="boton boton--secundario">
            Contactarme
          </SiteLink>
        </div>
      </div>
    </section>
  );
}

export default Inicio;