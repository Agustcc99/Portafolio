import { useEffect, useState } from "react";
import "./Navbar.css";

function Navbar() {
  const enlacesNavegacion = [
    { id: "inicio", texto: "Inicio" },
    { id: "sobre-mi", texto: "Sobre mí" },
    { id: "proyectos", texto: "Proyectos" },
    { id: "tecnologias", texto: "Tecnologías" },
    { id: "contacto", texto: "Contacto" },
  ];

  const [seccionActiva, setSeccionActiva] = useState("inicio");

  useEffect(() => {
    function actualizarSeccionActiva() {
      const posicionActual = window.scrollY + window.innerHeight * 0.35;

      let nuevaSeccionActiva = "inicio";

      enlacesNavegacion.forEach((enlaceNavegacion) => {
        const seccion = document.getElementById(enlaceNavegacion.id);

        if (seccion && seccion.offsetTop <= posicionActual) {
          nuevaSeccionActiva = enlaceNavegacion.id;
        }
      });

      const estaAlFinalDeLaPagina =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 20;

      if (estaAlFinalDeLaPagina) {
        nuevaSeccionActiva = "contacto";
      }

      setSeccionActiva(nuevaSeccionActiva);
    }

    actualizarSeccionActiva();

    window.addEventListener("scroll", actualizarSeccionActiva);
    window.addEventListener("resize", actualizarSeccionActiva);

    return () => {
      window.removeEventListener("scroll", actualizarSeccionActiva);
      window.removeEventListener("resize", actualizarSeccionActiva);
    };
  }, []);

  return (
    <header className="navbar">
      <a href="#inicio" className="navbar__logo" aria-label="Ir al inicio">
        <span className="navbar__logo-icono">A</span>
        <span className="navbar__logo-texto">
          Agustín<span>.dev</span>
        </span>
      </a>

      <nav className="navbar__menu" aria-label="Navegación principal">
        {enlacesNavegacion.map((enlaceNavegacion) => (
          <a
            key={enlaceNavegacion.id}
            href={`#${enlaceNavegacion.id}`}
            className={
              seccionActiva === enlaceNavegacion.id
                ? "navbar__enlace navbar__enlace--activo"
                : "navbar__enlace"
            }
          >
            {enlaceNavegacion.texto}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;