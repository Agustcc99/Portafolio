import Navbar from "./components/Navbar/Navbar";
import Inicio from "./sections/Inicio/Inicio";
import SobreMi from "./sections/SobreMi/SobreMi";
import Proyectos from "./sections/Proyectos/Proyectos";
import Tecnologias from "./sections/Tecnologias/Tecnologias";
import Contacto from "./sections/Contacto/Contacto";
import Footer from "./sections/Footer/Footer";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Inicio />
        <SobreMi />
        <Proyectos />
        <Tecnologias />
        <Contacto />
      </main>

      <Footer />
    </>
  );
}

export default App;