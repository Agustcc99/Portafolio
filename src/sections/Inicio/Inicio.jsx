import "./Inicio.css";

function Inicio() {
  return (
    <section id="inicio" className="inicio">
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
          <a href="#proyectos" className="boton boton--principal">
            Ver proyectos
          </a>

          <a href="#contacto" className="boton boton--secundario">
            Contactarme
          </a>
        </div>
      </div>
    </section>
  );
}

export default Inicio;