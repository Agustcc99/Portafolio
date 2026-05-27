import { useEffect, useRef, useState } from "react";

function SeccionAnimada({ children, className = "", id }) {
  const referenciaSeccion = useRef(null);
  const [estaVisible, setEstaVisible] = useState(false);

  useEffect(() => {
    const observadorDeSeccion = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setEstaVisible(true);
          observadorDeSeccion.unobserve(entrada.target);
        }
      },
      {
        threshold: 0.15,
      }
    );

    if (referenciaSeccion.current) {
      observadorDeSeccion.observe(referenciaSeccion.current);
    }

    return () => {
      if (referenciaSeccion.current) {
        observadorDeSeccion.unobserve(referenciaSeccion.current);
      }
    };
  }, []);

  return (
    <section
      id={id}
      ref={referenciaSeccion}
      className={`${className} seccion-animada ${
        estaVisible ? "seccion-animada--visible" : ""
      }`}
    >
      {children}
    </section>
  );
}

export default SeccionAnimada;