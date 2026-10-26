export const proyectos = [
  {
    id: 1,
    titulo: "Sistema de Gestión para Consultorio Odontológico",
    categoria: "Full Stack",
    destacado: true,
    color : "verde",
    descripcionCorta:
      "Sistema web para administrar pacientes, tratamientos, pagos, gastos de laboratorio y reportes financieros de un consultorio odontológico.",
    descripcionLarga:
      "Sistema web desarrollado para que una odontóloga pueda administrar su actividad dentro de un consultorio compartido. El objetivo principal no es asignar turnos, sino organizar la información económica y operativa relacionada con pacientes, tratamientos, pagos, gastos de laboratorio y saldos pendientes. La aplicación permite ingresar pacientes y asociarles tratamientos con sus respectivos precios y porcentajes de distribución según el acuerdo entre la odontóloga y el consultorio. También permite registrar pagos parciales en efectivo, visualizar saldos restantes y asociar gastos de laboratorio a tratamientos. Además, cuenta con reportes mensuales, semanales y de pendientes a pagar, mostrando saldos correspondientes a la odontóloga, al consultorio y al laboratorio. Los pagos se distribuyen en cascada: primero cubren laboratorio, luego el saldo de la odontóloga y finalmente el saldo del consultorio.",
    objetivo:
      "Crear una herramienta interna para mejorar la administración financiera de una odontóloga dentro de un consultorio compartido.",
    tecnologias: [
      "React",
      "JavaScript",
      "Bootstrap",
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose"
    ],
    funcionalidades: [
      "Login de acceso al sistema",
      "Gestión de pacientes",
      "Tratamientos asociados a pacientes",
      "Registro de pagos parciales",
      "Cálculo de saldos pendientes",
      "Gastos de laboratorio asociados a tratamientos",
      "Reportes mensuales",
      "Reportes semanales",
      "Reporte de pendientes a pagar",
      "Distribución de pagos en cascada"
    ],
    aprendizajes: [
      "Modelado de datos reales",
      "Aplicación de reglas de negocio",
      "Cálculo de saldos y porcentajes",
      "Desarrollo de reportes financieros",
      "Organización de una aplicación full stack"
    ],
    textoDemo: "Ver funcionamiento",
    demo: "#",
    codigo: "https://github.com/Agustcc99/ConsulAli",
    imagen: "",
    imagenes: [
      "/proyectos/consul/c2.png",      
      "/proyectos/consul/c3.png",      
      "/proyectos/consul/c4.png",      
      "/proyectos/consul/c5.png",      
      "/proyectos/consul/c6.png",      
      "/proyectos/consul/c7.png",

    ]
  },
  {
    id: 2,
    titulo: "Sistema de Presupuestos para Vidriería",
    categoria: "Full Stack",
    color : "celeste",
    destacado: true,
    descripcionCorta:
      "Aplicación web para calcular, guardar y enviar presupuestos de vidrios según medidas, espesor, tipo de vidrio y superficie.",
    descripcionLarga:
      "Sistema web desarrollado para una vidriería, pensado para automatizar el cálculo de presupuestos según medidas, espesor, tipo de vidrio y superficie. Permite guardar presupuestos en una lista, consultarlos posteriormente y enviarlos por WhatsApp. El backend fue construido con una estructura modular, separando controladores, rutas, modelos y middlewares para lograr un código más mantenible y escalable. También incluye autenticación con JWT y bcrypt para proteger el acceso al sistema.",
    objetivo:
      "Automatizar el cálculo de presupuestos de una vidriería y facilitar la organización y comunicación con clientes.",
    tecnologias: [
      "React",
      "JavaScript",
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose",
      "JWT",
      "bcrypt"
    ],
    funcionalidades: [
      "Cálculo de presupuestos según medidas",
      "Selección de espesor y tipo de vidrio",
      "Cálculo por superficie",
      "Guardado de presupuestos",
      "Listado de presupuestos registrados",
      "Envío de presupuestos por WhatsApp",
      "Login de usuario",
      "Autenticación con JWT"
    ],
    aprendizajes: [
      "Estructuración modular de un backend",
      "Conexión entre React y una API REST",
      "Uso de MongoDB para persistencia",
      "Implementación de autenticación segura",
      "Desarrollo de una solución para un negocio real"
    ],
    textoDemo: "Ver funcionamiento",
    demo: "#",
    codigo:
      "https://github.com/Agustcc99/Vidrieria-Presupuestos/tree/main/backend",
    imagen: "",
    imagenes: [
      "/proyectos/calculadora/v2.png",
      "/proyectos/calculadora/v3.png",
      "/proyectos/calculadora/v4.png",
      "/proyectos/calculadora/v1.png",
    ]
  },
  {
    id: 3,
    titulo: "Backend API para E-commerce",
    categoria: "Backend",
    color : "violeta",
    destacado: true,
    descripcionCorta:
      "API REST para la gestión de usuarios, productos y pedidos en un e-commerce, con autenticación JWT, roles, validaciones y tests automatizados.",
    descripcionLarga:
      "Sistema backend desarrollado para la gestión de un e-commerce, permitiendo administrar usuarios, productos y pedidos mediante una API REST construida con Node.js, Express y MongoDB. Incluye registro e inicio de sesión, autenticación con JWT, encriptación de contraseñas con bcrypt y autorización por roles. Los administradores pueden gestionar productos, usuarios y pedidos, mientras que los clientes pueden crear pedidos y consultar su historial. El proyecto está organizado por capas, separando controladores, rutas, modelos, middlewares, configuración y tests. También cuenta con una base de datos separada para testing y 24 tests automatizados con Jest y Supertest.",
    objetivo:
      "Construir una API REST robusta para un e-commerce, aplicando autenticación segura, autorización por roles, persistencia en MongoDB, validaciones, manejo de errores y pruebas automatizadas.",
    tecnologias: [
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose",
      "JWT",
      "bcrypt",
      "Jest",
      "Supertest",
      "Dotenv"
    ],
    funcionalidades: [
      "Registro de usuarios",
      "Inicio de sesión con JWT",
      "Hash de contraseñas con bcrypt",
      "Control de permisos por roles",
      "CRUD de productos",
      "Soft delete de productos",
      "Creación de pedidos",
      "Descuento automático de stock",
      "Listado de pedidos por usuario",
      "Tests automatizados con Jest y Supertest"
    ],
    aprendizajes: [
      "Diseño de APIs REST con Express",
      "Arquitectura backend por capas",
      "Autenticación y autorización con JWT",
      "Validación de peticiones",
      "Testing de endpoints",
      "Manejo de reglas de negocio como stock y pedidos"
    ],
    textoDemo: "Ver documentación",
    demo: "#",
    codigo: "https://github.com/Agustcc99/Proyecto-ZPR2-Back-Ecommerce/tree/main",
    imagen: "",
    imagenes: [
      ""
    ]
  },
  {
    id: 4,
    titulo: "Sistema de Turnos para Psiquiatría",
    categoria: "Full Stack",
    color: "rosa",
    destacado: false,
    descripcionCorta:
      "Sistema web para cargar, consultar y gestionar turnos médicos, con login, filtros avanzados y control de estados del paciente.",
    descripcionLarga:
      "Sistema web desarrollado para gestionar los turnos de una psiquiatra, permitiendo cargar pacientes y organizar las citas desde una interfaz simple y funcional. El sistema permite registrar turnos con datos como nombre del paciente, DNI, número de siniestro, fecha y horario. También cuenta con una lista lateral donde se pueden visualizar los turnos cargados y aplicar filtros por nombre, DNI, siniestro, fecha exacta o períodos determinados. Cada turno puede cambiar de estado según el seguimiento realizado: falta avisar, avisado, asistió o ausente. El acceso está protegido mediante login con autenticación JWT y contraseñas encriptadas con bcrypt.",
    objetivo:
      "Crear una herramienta web segura y práctica para cargar, consultar y controlar turnos médicos.",
    tecnologias: [
      "React",
      "JavaScript",
      "Bootstrap",
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose",
      "JWT",
      "bcrypt"
    ],
    funcionalidades: [
      "Login de usuario",
      "Carga de turnos médicos",
      "Registro de nombre, DNI y siniestro",
      "Registro de fecha y horario",
      "Lista lateral de turnos",
      "Filtro por nombre",
      "Filtro por DNI",
      "Filtro por siniestro",
      "Filtro por fecha exacta",
      "Filtro por rango de fechas",
      "Cambio de estado del turno"
    ],
    aprendizajes: [
      "Desarrollo de sistemas CRUD",
      "Implementación de login con JWT",
      "Creación de filtros por múltiples criterios",
      "Gestión de estados",
      "Diseño de interfaces administrativas"
    ],
    textoDemo: "Ver funcionamiento",
    demo: "#",
    codigo: "https://github.com/Agustcc99/TurnosPsq",
    imagen: "",
    imagenes: [
      "/proyectos/turnos/t2.png",
      "/proyectos/turnos/t3.png",
      "/proyectos/turnos/t4.png",
      "/proyectos/turnos/t1.png",


    ]
  },
  {
    id: 5,
    titulo: "Landing Page para Vidriería Villarroel",
    categoria: "Full Stack",
    color: "celeste",
    destacado: false,
    descripcionCorta:
      "Landing page comercial para una vidriería, con formulario de consultas y panel administrativo para visualizar solicitudes de presupuesto.",
    descripcionLarga:
      "Sitio web desarrollado para una vidriería, orientado a presentar sus servicios, captar consultas de potenciales clientes y facilitar la solicitud de presupuestos desde una landing page moderna y responsive. El proyecto incorpora un backend con Node.js, Express y MongoDB para guardar las consultas enviadas desde el formulario. Además, cuenta con una sección administrativa donde el negocio puede visualizar las solicitudes recibidas y gestionar mejor el contacto con los clientes.",
    objetivo:
      "Crear una presencia digital profesional para una vidriería, permitiendo mostrar servicios, captar clientes interesados y centralizar consultas en un panel administrativo.",
    tecnologias: [
      "React",
      "JavaScript",
      "Bootstrap",
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose"
    ],
    funcionalidades: [
      "Landing page comercial",
      "Diseño responsive",
      "Secciones informativas de servicios",
      "Formulario de solicitud de presupuesto",
      "Guardado de consultas en MongoDB",
      "Panel administrativo para ver consultas",
      "Arquitectura modular"
    ],
    aprendizajes: [
      "Desarrollo de landing pages con React",
      "Uso de Bootstrap",
      "Conexión de formularios con una API REST",
      "Persistencia de datos en MongoDB",
      "Creación de paneles administrativos simples"
    ],
    textoDemo: "Ver demo",
    demo: "#",
    codigo: "https://github.com/Agustcc99/Vidrieria-Villaroel-LandingPage/tree/main",
    imagen: "",
    imagenes: [
      "/proyectos/vidrioslanding/vl4.png",
      "/proyectos/vidrioslanding/vl1.png",
      "/proyectos/vidrioslanding/vl2.png",
      "/proyectos/vidrioslanding/vl3.png",
      "/proyectos/vidrioslanding/vl5.png",
      "/proyectos/vidrioslanding/vl6.png",

    ]
  },
  {
    id: 6,
    titulo: "App de Control de Hábitos",
    categoria: "Full Stack",
    color: "violeta",
    destacado: false,
    descripcionCorta:
      "Aplicación web para registrar consumos personales, con login de usuarios, notas, historial por hora exacta y reportes mensuales.",
    descripcionLarga:
      "Aplicación web desarrollada como herramienta personal para registrar y controlar el consumo de cigarrillos o tabaco. El sistema permite que distintos usuarios ingresen mediante login y mantengan sus propios registros separados. La app cuenta con un botón principal para sumar consumos de forma rápida. Al registrar un consumo, se puede indicar si corresponde a tabaco o cigarrillo, agregar notas y guardar automáticamente la hora exacta. También incluye una sección de reportes donde se puede consultar la cantidad registrada por mes y revisar el total separado por etiquetas o categorías.",
    objetivo:
      "Crear una aplicación simple y funcional para registrar consumos personales, visualizar el historial diario y obtener reportes mensuales.",
    tecnologias: [
      "React",
      "JavaScript",
      "Bootstrap",
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose",
      "JWT",
      "bcrypt"
    ],
    funcionalidades: [
      "Login de usuarios",
      "Datos separados por usuario",
      "Registro rápido de consumos",
      "Selección entre tabaco o cigarrillo",
      "Notas por registro",
      "Guardado de hora exacta",
      "Historial individual",
      "Reportes mensuales",
      "Conteo por etiquetas o categorías"
    ],
    aprendizajes: [
      "Desarrollo de una app personal funcional",
      "Registro rápido de eventos",
      "Manejo de fechas y horas exactas",
      "Clasificación de registros por tipo",
      "Creación de reportes mensuales"
    ],
    textoDemo: "Ver app",
    demo: "#",
    codigo: "https://github.com/Agustcc99/Control-Cigarrillos",
    imagen: "",
    imagenes: [
      "/proyectos/habitos/h2.png",
      "/proyectos/habitos/h3.png",
      "/proyectos/habitos/h4.png",  
      "/proyectos/habitos/h1.png",
    ]
  },
  {
    id: 7,
    titulo: "Landing Page para Comercio de Semillas",
    categoria: "Maquetación",
    color: "verde",
    destacado: false,
    descripcionCorta:
      "Maqueta de landing page estética para un comercio de semillas, desarrollada con HTML y CSS básico.",
    descripcionLarga:
      "Maqueta web desarrollada como landing page para un comercio de semillas, enfocada principalmente en la estética, la identidad visual y la presentación comercial. El proyecto fue realizado con HTML y CSS básico, sin funcionalidades dinámicas ni conexión a backend. Su objetivo principal fue practicar maquetación web, organización visual del contenido, jerarquías tipográficas, uso de colores, secciones comerciales y composición general de una página de presentación.",
    objetivo:
      "Diseñar una landing page visualmente atractiva para practicar maquetación web, estructura HTML, estilos CSS y presentación comercial de una marca.",
    tecnologias: ["HTML5", "CSS3"],
    funcionalidades: [
      "Página de inicio tipo landing",
      "Sección principal de presentación",
      "Bloques visuales de productos o categorías",
      "Diseño estético orientado a marca",
      "Estructura HTML organizada",
      "Estilos personalizados con CSS",
      "Maquetación básica sin frameworks"
    ],
    aprendizajes: [
      "Estructura semántica con HTML",
      "Uso de CSS para diseño visual",
      "Organización de una landing page",
      "Manejo de colores, espaciados y tipografías",
      "Práctica de diseño sin frameworks"
    ],
    textoDemo: "Ver maqueta",
    demo: "#",
    codigo: "https://github.com/Agustcc99/Semishop",
    imagen: "",
    imagenes: [
      "/proyectos/ss/ss1.png",
      "/proyectos/ss/ss2.png",
      "/proyectos/ss/ss3.png",
    ]
  }
];

export const categoriasProyectos = [
  "Todos",
  "Full Stack",
  "Backend",
  "Maquetación"
];