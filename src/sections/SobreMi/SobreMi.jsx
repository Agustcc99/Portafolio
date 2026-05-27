import SectionTitle from "../../components/SectionTitle/SectionTitle";
import SeccionAnimada from "../../components/SeccionAnimada/SeccionAnimada";
import "./SobreMi.css";

function SobreMi() {
  return (
    <SeccionAnimada id="sobre-mi" className="sobre-mi">
      <SectionTitle
        etiqueta="Sobre mí"
        titulo="Un perfil técnico con mirada práctica"
        descripcion="Me interesa desarrollar soluciones útiles, bien organizadas y pensadas para problemas reales."
      />

      <div className="sobre-mi__grid">
        <article className="sobre-mi__card">
          <h3>Quién soy</h3>
          <p>
            Soy Agustín Tacconi, desarrollador web y gastronómico profesional.
            Hace 2 años vengo creando proyectos con JavaScript, React, Node y
            MongoDB. Me interesa construir soluciones útiles para problemas
            reales, combinando lógica, diseño y una mirada práctica.
          </p>
        </article>

        <article className="sobre-mi__card">
          <h3>Qué busco</h3>
          <p>
            Busco adentrarme en el mundo profesional del desarrollo web,
            participar en proyectos reales y seguir creciendo como desarrollador.
            No me cierro a una sola área: me interesa el frontend, el backend y
            seguir formándome en herramientas como AWS. Me motivan tanto las
            tareas simples como los desafíos que me obligan a mejorar.
          </p>
        </article>

        <article className="sobre-mi__card">
          <h3>Cómo trabajo</h3>
          <p>
            Trabajo de forma ordenada, responsable y paso a paso. Primero busco
            entender bien el problema, dividirlo en partes simples y mantener
            una estructura clara en carpetas, componentes y funciones. Cuando
            aparece un error, investigo, pruebo alternativas y pido ayuda si
            hace falta. Me adapto tanto al trabajo individual como al trabajo en
            equipo.
          </p>
        </article>
      </div>
    </SeccionAnimada>
  );
}

export default SobreMi;