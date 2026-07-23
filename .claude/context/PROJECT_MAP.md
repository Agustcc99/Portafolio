# PROJECT_MAP — Portafolio (Agustín Tacconi)

Stack: React 19 + Vite 8, sin router (SPA de una sola página, secciones ancladas por id). CSS plano por módulo (sin CSS modules, sin Tailwind). Bootstrap como dep pero uso puntual. lucide-react para iconos.
Scripts: `npm run dev` | `build` | `lint` | `preview`.

## Árbol

```
src/
  main.jsx                        bootstrap ReactDOM
  App.jsx                         compone Navbar + secciones + Footer
  App.css, index.css              estilos globales
  data/
    proyectos.js                  contenido de los 7 proyectos del carrusel
    tecnologias.js                mapa de arquitectura técnica (stack por categoría)
  components/
    Navbar/Navbar.jsx
    SeccionAnimada/SeccionAnimada.jsx
    SectionTitle/SectionTitle.jsx
    ProyectoCard/ProyectoCard.jsx
    ProyectoModal/ProyectoModal.jsx
    InteractiveHeroGrid/InteractiveHeroGrid.jsx   canvas grid interactivo (hero)
    ContactPortal/
      ContactPortal.jsx           portal animado sección contacto
      CurvedPortalText.jsx        texto curvado SVG (título del portal)
      PortalParticles.jsx         canvas de partículas del portal
  sections/
    Inicio/Inicio.jsx
    SobreMi/SobreMi.jsx
    Proyectos/Proyectos.jsx       carrusel 3D de proyectos
    Tecnologias/
      Tecnologias.jsx             mapa de categorías técnicas + modal
      TechnologyModal.jsx         detalle de una tecnología
    Contacto/Contacto.jsx
    Footer/Footer.jsx
public/proyectos/**                capturas de cada proyecto (Consul, Calculadora, Turnos, VidriosLanding, Habitos, SS)
```

## Componentes y funciones exportadas

### `App.jsx`
- `App() -> JSX` — orquesta layout: Navbar, main (Inicio/SobreMi/Proyectos/Tecnologias/Contacto), Footer.

### `data/proyectos.js`
- `proyectos: Array` — 7 proyectos (id, titulo, categoria, color, descripciones, tecnologias[], funcionalidades[], aprendizajes[], demo, codigo, imagenes[]).
- `categoriasProyectos: string[]` — ["Todos","Full Stack","Backend","Maquetación"] (nota: no se usa como filtro visible en Proyectos.jsx actualmente).

### `data/tecnologias.js`
- `CATEGORIAS_TECNICAS: Array` — 4 categorías (interfaz/logica/datos/entrega) con id, numero, nombre, color, descripcion, tecnologias[] (slugs).
- `NIVELES_TECNICOS: {principal, proyectos, aprendizaje}` — etiqueta + marcador por nivel.
- `TECNOLOGIAS_INFO: {[slug]: {nombre, nivel, usadoPara[], funcionalidades[], proyectos[]}}` — ficha por tecnología; `proyectos` referencia ids de proyectos.js o "portfolio".

### `components/Navbar/Navbar.jsx`
- `Navbar() -> JSX` — nav fija con scroll-spy propio (calcula sección activa por `offsetTop` + scroll, sin IntersectionObserver).

### `components/SeccionAnimada/SeccionAnimada.jsx`
- `SeccionAnimada({children, className, id}) -> JSX` — wrapper `<section>` que agrega clase `--visible` al entrar en viewport (IntersectionObserver, threshold 0.15, dispara una sola vez).

### `components/SectionTitle/SectionTitle.jsx`
- `SectionTitle({etiqueta, titulo, descripcion}) -> JSX` — encabezado de sección reutilizable.

### `components/ProyectoCard/ProyectoCard.jsx`
- `ProyectoCard({proyecto, abrirModalProyecto}) -> JSX` — tarjeta de proyecto (usada dentro del carrusel).

### `components/ProyectoModal/ProyectoModal.jsx`
- `GaleriaProyecto({proyectoSeleccionado}) -> JSX` (interno) — carrusel de imágenes con miniaturas, flechas y contador.
- `ProyectoModal({proyectoSeleccionado, cerrarModal}) -> JSX|null` — modal vía `createPortal`, cierra con Escape, bloquea scroll body, muestra descripción larga/objetivo/tecnologías/funcionalidades/aprendizajes.

### `components/InteractiveHeroGrid/InteractiveHeroGrid.jsx`
- `InteractiveHeroGrid() -> JSX` — canvas fullsize con grilla de puntos que reacciona al puntero (desktop) u ola ambiental (touch). Respeta `prefers-reduced-motion`, pausa con IntersectionObserver/visibilitychange.
- Config centralizada en objeto `CONFIG` al tope del archivo (spacing, radios, colores, velocidades).
- Internas: `falloff`, `drawLight`, `applyCursorForces`, `applyAmbientWave`, `buildGrid`, `drawFrame`.

### `components/ContactPortal/ContactPortal.jsx`
- `ContactPortal() -> JSX` — botón CTA "portal" animado que enlaza a WhatsApp; loop rAF propio, magnetismo del botón, halos SVG, integra `CurvedPortalText` y `PortalParticles`.
- Enlaces hardcodeados: `WHATSAPP_URL`, `EMAIL_URL` (mailto), `GITHUB_URL`.
- Config en `PORTAL_CONFIG` (radios, easing, duraciones).
- Internas: `clamp`, `falloff`, `buildLineData`, `buildWordData`.

### `components/ContactPortal/CurvedPortalText.jsx`
- `CurvedPortalText({text, radius, position, fontSize, letterSpacing, className}) -> JSX` — texto sobre arco SVG (`textPath`), arriba o abajo.

### `components/ContactPortal/PortalParticles.jsx`
- `PortalParticles({interactionRef, isCoarsePointer, reducedMotion}) -> JSX` — canvas de partículas orbitando el portal, "tragadas" cuando `open` supera umbral; lee estado compartido vía `interactionRef` (sin re-renders de React).
- Internas: `pickColor`, `createParticles`.

### `sections/Inicio/Inicio.jsx`
- `Inicio() -> JSX` — hero con `InteractiveHeroGrid` de fondo + copy + CTAs (#proyectos, #contacto).

### `sections/SobreMi/SobreMi.jsx`
- `SobreMi() -> JSX` — 3 cards estáticas (Quién soy / Qué busco / Cómo trabajo).

### `sections/Proyectos/Proyectos.jsx`
- `Proyectos() -> JSX` — carrusel 3D (transform perspective) de proyectos, arrastrable con Pointer Events.
- `abrirModalProyecto`, `cerrarModalProyecto`, `irA(indice)`, `obtenerPasoPx()`, `manejarPointerDown/Move/Up(evento)`, `manejarClickSlot(indice)`.
- Constantes de tuning al tope: `ANCHO_SLOT_POR_DEFECTO, PASO_RATIO, ROTACION_MAXIMA, PROFUNDIDAD_PASO, ESCALA_PASO, OPACIDAD_PASO, UMBRAL_ARRASTRE_RATIO, UMBRAL_CLICK_PX`.
- Nota: pointer capture se activa solo tras superar `UMBRAL_CLICK_PX` para no romper el click de los botones internos de la card.

### `sections/Tecnologias/Tecnologias.jsx`
- `Tecnologias() -> JSX` — "mapa de arquitectura" con 4 tarjetas de categoría + conectores SVG entre ellas que se iluminan on hover; abre `TechnologyModal` al clickear un chip de tecnología.
- `abrirTecnologia(slug, elementoDisparador)`, `solicitarCierreModal()`, `alTerminarCierreModal()`, `conectorActivo(idA, idB)`.
- Orden de tarjetas distinto en desktop vs móvil (`ORDEN_TARJETAS_ESCRITORIO/MOVIL`), breakpoint 640px.
- Animación de entrada + "pulso" único 2s después de entrar en viewport (`RETRASO_PULSO_MS`).

### `sections/Tecnologias/TechnologyModal.jsx`
- `TechnologyModal({slug, categoriaColor, abierto, reducedMotion, onCerrar, onCerradoCompleto}) -> JSX` — modal de detalle de una tecnología vía `createPortal`; focus trap manual (Tab/Shift+Tab), Escape cierra, compensa ancho de scrollbar al bloquear scroll.
- `nombreDeProyecto(entrada)` — resuelve id de proyecto o "portfolio" a título legible.
- Espera `DURACION_CIERRE_MS` (220ms) antes de desmontar tras pedir cierre (salvo reduced motion).

### `sections/Contacto/Contacto.jsx`
- `Contacto() -> JSX` — wrapper `SeccionAnimada` + `ContactPortal`.

### `sections/Footer/Footer.jsx`
- `Footer() -> JSX` — copyright con año dinámico (`new Date().getFullYear()`).

## DEPS CLAVE

- `App.jsx` → todas las secciones + `Navbar`.
- `sections/Proyectos` → `components/ProyectoCard`, `components/ProyectoModal`, `data/proyectos`.
- `sections/Tecnologias` → `sections/Tecnologias/TechnologyModal`, `data/tecnologias`.
- `sections/Tecnologias/TechnologyModal` → `data/proyectos` (cruza slug de tecnología con proyectos que la usan).
- `sections/Inicio` → `components/InteractiveHeroGrid`.
- `sections/Contacto` → `components/ContactPortal` → `CurvedPortalText` + `PortalParticles`.
- Todas las secciones (salvo Inicio) se envuelven en `components/SeccionAnimada` para el fade-in on scroll.

## Convenciones notadas

- Nombres de funciones/variables en español; JSX y estructura en inglés/estándar React.
- Cada componente/sección visual trae su propio `.css` homónimo (sin CSS-in-JS).
- Animaciones custom vía canvas + rAF con guardas de `prefers-reduced-motion`, `IntersectionObserver` y `visibilitychange` (patrón repetido en InteractiveHeroGrid, ContactPortal, PortalParticles).
- Constantes de tuning visual se agrupan en objetos `CONFIG`/`PORTAL_CONFIG` al tope de archivo, no dispersas.

## PENDIENTE

- Ninguno detectado (sin TODO/FIXME/XXX en `src/`).

## ULTIMO COMMIT MAPEADO: 50d35d3152c31d7e7a324dbd8b5e92f194809246
