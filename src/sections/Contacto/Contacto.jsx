import SectionTitle from "../../components/SectionTitle/SectionTitle";
import SeccionAnimada from "../../components/SeccionAnimada/SeccionAnimada";
import "./Contacto.css";

function Contacto() {
  return (
    <SeccionAnimada id="contacto" className="contacto">
      <SectionTitle etiqueta="Contacto" titulo="¿Trabajamos juntos?" />

      <div className="contacto__card">
        <div className="contacto__contenido">
          <p>
            Estoy abierto a oportunidades, prácticas, proyectos y colaboraciones
            donde pueda seguir creciendo.
          </p>
        </div>

        <div className="contacto__datos">
          <a
            href="mailto:Pupitacconi@gmail.com?subject=Contacto%20desde%20tu%20portafolio&body=Hola%20Agust%C3%ADn%2C%20vi%20tu%20portafolio%20y%20quer%C3%ADa%20contactarte."
            className="contacto__dato"
          >
            <span>Email</span>
            <strong>Pupitacconi@gmail.com</strong>
          </a>

          <a
            href="https://wa.me/543516813599"
            target="_blank"
            rel="noreferrer"
            className="contacto__dato"
          >
            <span>WhatsApp</span>
            <strong>+54 351 681 3599</strong>
          </a>

          <a
            href="https://github.com/Agustcc99?tab=repositories"
            target="_blank"
            rel="noreferrer"
            className="contacto__dato"
          >
            <span>GitHub</span>
            <strong>Agustcc99</strong>
          </a>
        </div>
      </div>
    </SeccionAnimada>
  );
}

export default Contacto;