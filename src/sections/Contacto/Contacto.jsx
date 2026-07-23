import SeccionAnimada from "../../components/SeccionAnimada/SeccionAnimada";
import SectionTitle from "../../components/SectionTitle/SectionTitle";
import ContactPortal from "../../components/ContactPortal/ContactPortal";
import "./Contacto.css";

function Contacto() {
  return (
    <SeccionAnimada id="contacto" className="contacto">
      <SectionTitle titulo="¿Trabajamos juntos?" />
      <ContactPortal />
    </SeccionAnimada>
  );
}

export default Contacto;
