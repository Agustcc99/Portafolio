// Estructura central del mapa de arquitectura de la sección "Tecnologías".
// Para agregar una tecnología: sumarla al arreglo `tecnologias` de la categoría
// correspondiente y crear su entrada en TECNOLOGIAS_INFO con el mismo slug.

export const CATEGORIAS_TECNICAS = [
  {
    id: "interfaz",
    numero: "01",
    nombre: "Interfaz",
    color: "verde",
    descripcion:
      "Interfaces responsive, componentes reutilizables, formularios, rutas y consumo de APIs.",
    tecnologias: ["html", "css", "javascript", "react", "vite", "bootstrap"],
  },
  {
    id: "logica",
    numero: "02",
    nombre: "Lógica y servicios",
    color: "celeste",
    descripcion:
      "APIs REST, autenticación, validaciones, permisos y lógica de negocio.",
    tecnologias: ["nodejs", "express", "java", "springboot", "jwt"],
  },
  {
    id: "datos",
    numero: "03",
    nombre: "Datos",
    color: "violeta",
    descripcion: "Modelado, relaciones, consultas y persistencia de información.",
    tecnologias: ["mysql", "mongodb"],
  },
  {
    id: "entrega",
    numero: "04",
    nombre: "Herramientas y entrega",
    color: "magenta",
    descripcion:
      "Control de versiones, pruebas de endpoints, contenedores y despliegue.",
    tecnologias: ["git", "github", "postman", "jest", "junit", "docker", "aws"],
  },
];

// Niveles honestos (sin porcentajes): "principal" | "proyectos" | "aprendizaje".
export const NIVELES_TECNICOS = {
  principal: { etiqueta: "Uso principal", marcador: "●" },
  proyectos: { etiqueta: "Utilizado en proyectos", marcador: "◆" },
  aprendizaje: { etiqueta: "En aprendizaje", marcador: "○" },
};

// `proyectos` referencia ids reales de src/data/proyectos.js, o el string
// especial "portfolio" para este mismo sitio (verificable por package.json).
export const TECNOLOGIAS_INFO = {
  html: {
    nombre: "HTML5",
    nivel: "principal",
    usadoPara: ["Estructura semántica de páginas"],
    funcionalidades: ["Estructura HTML organizada", "Maquetación de secciones comerciales"],
    proyectos: [7],
  },
  css: {
    nombre: "CSS3",
    nivel: "principal",
    usadoPara: ["Estilos visuales, layout y responsive"],
    funcionalidades: ["Diseño estético orientado a marca", "Manejo de colores, espaciados y tipografías"],
    proyectos: [7],
  },
  javascript: {
    nombre: "JavaScript",
    nivel: "principal",
    usadoPara: ["Lógica de interfaz", "Consumo de APIs", "Validaciones en frontend"],
    funcionalidades: ["Interacción de usuario", "Manejo de estado y eventos"],
    proyectos: [1, 2, 4, 5, 6],
  },
  react: {
    nombre: "React",
    nivel: "principal",
    usadoPara: ["Interfaces basadas en componentes", "Rutas y consumo de APIs"],
    funcionalidades: ["Componentes reutilizables", "Formularios controlados"],
    proyectos: [1, 2, 4, 5, 6],
  },
  vite: {
    nombre: "Vite",
    nivel: "principal",
    usadoPara: ["Entorno de desarrollo y build de aplicaciones React"],
    funcionalidades: ["Servidor de desarrollo rápido", "Build optimizado para producción"],
    proyectos: ["portfolio"],
  },
  bootstrap: {
    nombre: "Bootstrap",
    nivel: "principal",
    usadoPara: ["Maquetación rápida y componentes UI"],
    funcionalidades: ["Grillas responsive", "Componentes de formulario"],
    proyectos: [1, 4, 5, 6],
  },
  nodejs: {
    nombre: "Node.js",
    nivel: "principal",
    usadoPara: ["Entorno de ejecución del backend"],
    funcionalidades: ["APIs REST", "Procesos del servidor"],
    proyectos: [1, 2, 3, 4, 5, 6],
  },
  express: {
    nombre: "Express",
    nivel: "principal",
    usadoPara: ["Construcción de APIs REST", "Ruteo y middlewares"],
    funcionalidades: ["Rutas y controladores", "Middlewares de autenticación y validación"],
    proyectos: [1, 2, 3, 4, 5, 6],
  },
  java: {
    nombre: "Java",
    nivel: "proyectos",
    usadoPara: ["Programación orientada a objetos", "Desarrollo de apps en Android Studio (facultad)"],
    funcionalidades: [],
    proyectos: [],
  },
  springboot: {
    nombre: "Spring Boot",
    nivel: "proyectos",
    usadoPara: ["Construcción de APIs en Java"],
    funcionalidades: ["CRUD básico"],
    proyectos: [],
  },
  jwt: {
    nombre: "JWT",
    nivel: "proyectos",
    usadoPara: ["Autenticación y sesiones sin estado"],
    funcionalidades: ["Login de usuarios", "Roles y permisos"],
    proyectos: [2, 3, 4, 6],
  },
  mysql: {
    nombre: "MySQL",
    nivel: "aprendizaje",
    usadoPara: ["Bases de datos relacionales (lo básico)", "Actualmente en uso en un proyecto en desarrollo"],
    funcionalidades: [],
    proyectos: [],
  },
  mongodb: {
    nombre: "MongoDB",
    nivel: "principal",
    usadoPara: ["Persistencia de datos no relacional"],
    funcionalidades: ["Modelado con Mongoose", "Consultas y relaciones entre colecciones"],
    proyectos: [1, 2, 3, 4, 5, 6],
  },
  git: {
    nombre: "Git",
    nivel: "principal",
    usadoPara: ["Control de versiones"],
    funcionalidades: ["Historial de cambios", "Ramas de trabajo"],
    proyectos: [1, 2, 3, 4, 5, 6, 7],
  },
  github: {
    nombre: "GitHub",
    nivel: "principal",
    usadoPara: ["Alojamiento de repositorios"],
    funcionalidades: ["Repositorio público por proyecto"],
    proyectos: [1, 2, 3, 4, 5, 6, 7],
  },
  docker: {
    nombre: "Docker",
    nivel: "aprendizaje",
    usadoPara: ["Contenedores para entornos reproducibles"],
    funcionalidades: [],
    proyectos: [],
  },
  postman: {
    nombre: "Postman",
    nivel: "principal",
    usadoPara: ["Pruebas manuales de endpoints REST en casi todos los proyectos con API"],
    funcionalidades: ["Verificación de rutas y respuestas de API"],
    proyectos: [1, 2, 3, 4, 5, 6],
  },
  jest: {
    nombre: "Jest",
    nivel: "proyectos",
    usadoPara: ["Testing automatizado de APIs REST"],
    funcionalidades: ["Tests automatizados con Jest y Supertest"],
    proyectos: [3],
  },
  junit: {
    nombre: "JUnit",
    nivel: "aprendizaje",
    usadoPara: ["Testing unitario en aplicaciones Java"],
    funcionalidades: [],
    proyectos: [],
  },
  aws: {
    nombre: "AWS",
    nivel: "aprendizaje",
    usadoPara: ["Materia cursada en la facultad", "Sabría diseñar una infraestructura básica"],
    funcionalidades: [],
    proyectos: [],
  },
};

