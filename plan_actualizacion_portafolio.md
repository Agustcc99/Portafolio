# Plan maestro de actualización — Portafolio de Agustín Tacconi

> Generado el 2026-10-26. Documento pensado para ejecutarse en **sesiones futuras de Claude Code**, fase por fase.
> Regla de oro: **no se avanza de fase hasta cumplir su "Criterio de salida"**. Cada fase termina con un commit propio.

---

## 0. Resumen ejecutivo

El proyecto actual es una **SPA React 19 + Vite 8** (no Django; no hay templates `.html` ni vistas). Se mantiene esa base y se rediseña por completo la capa visual y de animación:

- **Estética:** *dark tech refinado* (estilo Linear / Vercel) con **un solo acento**, tipografía propia no genérica y tema **claro + oscuro**.
- **Animación nivel alto:** Motion + GSAP/ScrollTrigger + Lenis, con coreografía de scroll, reveals de texto, transiciones de ruta y de tema. Sin cursor personalizado.
- **Bilingüe real (ES/EN)** con URLs por idioma, `hreflang`, SEO por ruta y prerender de metadatos.
- **Proyectos escalables:** carrusel 3D como vitrina en el home + índice filtrable + página de detalle por proyecto (`/proyectos/:slug`). Sumar un proyecto = agregar un archivo de datos.
- **TypeScript**, **Tailwind v4**, rendimiento / accesibilidad / SEO incluidos, despliegue en **Vercel** con dominio propio.

### Lo que NO se hace (por decisión tuya)
- Cursor personalizado.
- Secciones nuevas (se mantienen: Inicio, Sobre mí, Proyectos, Tecnologías, Contacto).
- Backend, formulario con envío, Django.

---

## 1. Decisiones tomadas

| # | Tema | Decisión | Justificación |
|---|------|----------|---------------|
| 1 | Base | **React + Vite** (sin Django) | Los componentes interactivos (canvas, carrusel 3D, portal) no tienen equivalente razonable en templates. No hay necesidad de backend. |
| 2 | Estilos | **Tailwind CSS v4** + CSS co-locado solo para piezas complejas | Ver §1.1 |
| 3 | Animación | **Motion** (UI/estado) + **GSAP + ScrollTrigger** (coreografía de scroll y texto) + **Lenis** (scroll suave) | Ver §1.2 |
| 4 | Lenguaje | **TypeScript** (migración completa) | Los datos de proyectos/tecnologías/i18n se benefician de tipos; evita errores al escalar proyectos. |
| 5 | Estética | **Dark tech refinado** | Elegida por vos (opción b). |
| 6 | Paleta | **Un solo acento** (lima eléctrico) sobre grafito, ver §3.1 | Ver §3.1 |
| 7 | Tema | **Oscuro + claro** con selector y respeto de `prefers-color-scheme` | Elegido por vos. |
| 8 | Tipografía | **Bricolage Grotesque + Instrument Serif (itálica de énfasis) + Geist + Geist Mono** | Ver §3.2 |
| 9 | Animación | Nivel **alto** | Elegido por vos. |
| 10 | Piezas firma | Se **conservan y refinan**: grilla del hero, carrusel 3D, portal de contacto. Se rediseña el resto. | Elegido por vos. |
| 11 | Extras | Barra de progreso, intro, transiciones, botones magnéticos, toggle de movimiento reducido. **Sin cursor custom.** | Elegido por vos. |
| 12 | Proyectos | Carrusel (destacados) + `/proyectos` + `/proyectos/:slug` | Ver §6.4 |
| 13 | Secciones | Sin secciones nuevas | Elegido por vos. |
| 14 | Perf/SEO/A11y | Incluidos como fase propia + reglas transversales | Elegido por vos. |
| 15 | i18n / deploy | **ES + EN** igual prioridad, mobile prioritario, **Vercel** + dominio propio | Elegido por vos. |

### 1.1 Por qué Tailwind v4 (y no CSS plano ni CSS Modules)

**A favor**
1. Hoy hay ~4.800 líneas de CSS plano con paleta neón. El rediseño las reescribe casi todas, así que **el costo de migrar es prácticamente cero**: se reescribe una vez, no dos.
2. El problema real del código actual no es el *scope* de los estilos (cada componente ya tiene su `.css`), sino la **falta de tokens y consistencia**. Tailwind v4 define tokens en CSS (`@theme`) como fuente única de verdad: colores de ambos temas, tipografía, espaciados, easings. Esos mismos tokens quedan disponibles como variables CSS para el JS (canvas, GSAP, Motion).
3. Responsive, estados (`hover:`, `focus-visible:`, `aria-*:`, `data-*:`), `dark:` y `motion-reduce:` inline → menos CSS muerto, más consistencia en mobile (prioridad tuya).
4. v4 se integra con un solo plugin (`@tailwindcss/vite`), sin `tailwind.config.js`, y genera solo el CSS usado.
5. Las sesiones de Claude Code producen resultados más consistentes con utilidades + tokens que con CSS libre.

**En contra (aceptados)**
- El markup es más verboso → se mitiga con componentes UI reutilizables (`Button`, `Chip`, `Container`…) y `cn()` (clsx + tailwind-merge).
- Las piezas muy específicas (canvas, carrusel 3D con `perspective`, portal SVG) se escriben mejor en CSS → **se conservan como `.css` co-locado**, usando los mismos tokens (`var(--color-accent)`).

**Descartado:** CSS Modules (no resuelve tokens/tema) y CSS plano con tokens (viable, pero más lento y menos consistente de sostener con dos temas y dos idiomas).

### 1.2 Por qué Motion + GSAP + Lenis

| Librería | Rol exclusivo | Por qué |
|---|---|---|
| **Motion** (`motion`, ex Framer Motion) | Animación ligada al estado de React: montaje/desmontaje (`AnimatePresence`), `layout`, hover/tap, springs, drag, `useScroll`/`useTransform` simples, indicador activo del navbar, filtros de proyectos | API declarativa, encaja con React 19. Usar `LazyMotion` + `m.*` para reducir peso. |
| **GSAP + ScrollTrigger (+ SplitText)** | Coreografía: intro del hero, split de texto, secciones con *pin*/*scrub*, dibujo de conectores SVG | Control de timelines imposible de igualar con Motion para scroll narrativo. Se carga con `import()` dinámico solo donde se usa. *Verificar la licencia vigente al instalar (a la fecha del plan, GSAP y sus plugins son gratuitos).* |
| **Lenis** | Scroll suave | ~3 KB; scrollea el `window` real, así que `useScroll` de Motion y ScrollTrigger funcionan sin adaptaciones (sincronizar con `gsap.ticker`). Se desactiva con movimiento reducido y en táctil. |

**Reglas para que convivan:**
- Un mismo elemento **nunca** lo anima Motion *y* GSAP a la vez.
- Solo se animan `transform` y `opacity` (más `clip-path` / `filter` puntuales en elementos pequeños).
- Todo respeta el estado global de "movimiento reducido" (OS + toggle manual).
- Todo se limpia en el unmount (`gsap.context().revert()`, cancelar rAF, desconectar observers).

---

## 2. Stack de frontend

Versiones vigentes al 2026-10-26 (**ejecutar `npm view <pkg> version` antes de instalar y usar la última estable compatible**).

### Dependencias
```
react@19, react-dom@19            (ya instalados)
react-router                      routing declarativo con prefijo de idioma (verificar si el paquete a usar es `react-router` o `react-router-dom` en la versión actual)
i18next@26, react-i18next@17      i18n
motion@14                         animación UI
gsap@3.15                         animación de scroll/texto (dynamic import)
lenis@1.3                         scroll suave
lucide-react                      iconos (ya instalado, tree-shaken)
clsx, tailwind-merge              utilidad cn()
@fontsource-variable/bricolage-grotesque
@fontsource/instrument-serif
@fontsource-variable/geist
@fontsource-variable/geist-mono   fuentes self-hosted (sin requests a Google, sin FOUT largo)
```

### Dev
```
tailwindcss@4, @tailwindcss/vite
typescript                        (TS 7.x existe; verificar compatibilidad con typescript-eslint y @vitejs/plugin-react. Si hay fricción, usar la última 5.x/6.x)
typescript-eslint
sharp                             optimización de imágenes (script)
```

### A eliminar
- `bootstrap` (instalado, **no se importa en ningún archivo**).
- `lucide` (duplicado; solo se usa `lucide-react`).
- Código de plantilla de Vite en `src/App.css` (`.counter`, `.hero`, `#next-steps`, `#docs`, `#spacer`, `.ticks`) — solo se usa `.seccion-animada`, que se reemplaza.
- `src/assets/hero.png`, `react.svg`, `vite.svg`, `public/icons.svg` si no tienen referencias (verificar con grep).

### Decisión de prerender / SEO
- **Primario:** SPA + **prerender de metadatos por ruta** con un script post-build (`scripts/prerender-meta.mjs`) que genera `dist/<ruta>/index.html` con `<title>`, description, canonical, `hreflang`, Open Graph/Twitter y JSON-LD correctos por idioma y por proyecto. Cubre previews de WhatsApp/LinkedIn (que no ejecutan JS) y a Google.
- **Por qué no SSG completo:** `vite-react-ssg` (0.9.2) declara peer `react-router-dom ^6`; el canvas, GSAP, Lenis y el portal requerirían guardas SSR en todo. Es más riesgo que beneficio para un portafolio. Si más adelante se quiere, es una mejora incremental.

---

## 3. Sistema de diseño

### 3.1 Color (tokens en `@theme`, tema vía `data-theme` en `<html>`)

**Acento único: lima eléctrico.** Justificación: tu identidad actual ya gira en torno al verde del CTA; se lo "adulta" (menos neón puro, más chartreuse) y se **retiran** magenta, cian, violeta y dorado. Un solo acento sobre grafito es lo que separa un diseño *refinado* de uno *gamer*. Es un único token: si en la Fase 1 al verlo en pantalla no convence, se cambia en una línea (alternativas a probar: violeta `#8B5CF6`, azul eléctrico `#4D7CFF`).

| Token | Oscuro | Claro |
|---|---|---|
| `--bg` | `#0A0A0C` | `#F6F5F0` |
| `--surface-1` | `#101014` | `#FFFFFF` |
| `--surface-2` | `#16161B` | `#EFEEE8` |
| `--line` | `rgba(255,255,255,.08)` | `rgba(10,10,12,.09)` |
| `--line-strong` | `rgba(255,255,255,.16)` | `rgba(10,10,12,.18)` |
| `--text` | `#A4A4AE` | `#55555E` |
| `--text-strong` | `#F5F5F7` | `#0E0E12` |
| `--muted` | `#6B6B76` | `#8A8A94` |
| `--accent` (relleno) | `#C4F542` | `#B5E32A` |
| `--accent-ink` (texto sobre acento) | `#0C1203` | `#0C1203` |
| `--accent-text` (acento usado como texto/ícono) | `#C4F542` | `#3F6212` |
| `--accent-glow` | `rgba(196,245,66,.18)` | `rgba(63,98,18,.12)` |

Reglas:
- Contraste mínimo **WCAG AA** (4.5:1 texto, 3:1 UI). Validar cada par en ambos temas.
- El acento aparece en: CTA principal, foco, indicador activo, barra de progreso, detalles de datos. **Nunca** como gradiente de texto multicolor.
- Los campos `color: "verde"` de `proyectos.js` quedan **obsoletos**; las categorías se distinguen por texto/chip neutro.
- Fondo: grafito plano + *glow* radial muy sutil del acento (≤ 8 % opacidad) + grano SVG estático al 2–3 %. Se eliminan los tres `radial-gradient` neón del `body`.
- Sombras: casi nulas en oscuro (se usan bordes `--line` y *inner highlights* `inset 0 1px 0 rgba(255,255,255,.06)`); suaves en claro.

### 3.2 Tipografía

Elegida para **no ser genérica** y dar carácter editorial sin perder lo técnico. Todas con soporte de latín extendido (tildes, ñ). Auto-hospedadas con `@fontsource` y `font-display: swap`, precargando solo Bricolage 600–800 y Geist 400–500.

| Rol | Fuente | Uso |
|---|---|---|
| Display | **Bricolage Grotesque** (variable: `wght`, `wdth`, `opsz`) | H1/H2, números grandes. Tracking −0.03em. |
| Énfasis editorial | **Instrument Serif** *itálica* | 1–2 palabras por título (ej. "interfaces *que funcionan*"). Es la firma visual. |
| Texto | **Geist Sans** | Párrafos, UI. |
| Técnico | **Geist Mono** | Etiquetas de sección (`01 — Sobre mí`), chips de tecnología, metadatos, contadores. |

Escala fluida (`clamp`):
- `display`: `clamp(2.75rem, 1.2rem + 6.5vw, 7rem)` / lh 0.95
- `h2`: `clamp(2rem, 1.2rem + 3.2vw, 4rem)` / lh 1.02
- `h3`: `1.5rem` / lh 1.2
- `body`: `1.0625rem` / lh 1.65 (máx. 68 ch por línea)
- `small`: `0.875rem`
- `label` (mono): `0.75rem`, uppercase, tracking `0.12em`

Plan B si alguna no convence al verla (Fase 1 incluye una página `/__styleguide` para compararlas): Space Grotesk / Sora / Fraunces.

### 3.3 Layout, radios, espaciado
- **Se elimina el `#root` fijo de 1180px** y la "tarjeta" redondeada del hero. Se usa `Container` (`max-w-[1280px]`, `px: clamp(1rem, 4vw, 3rem)`) y secciones a sangre completa.
- Padding vertical de sección: `clamp(5rem, 12vw, 10rem)`.
- Grilla de 12 columnas en desktop; 4 en mobile. Base de espaciado 4 px.
- Radios: `--r-sm 8px`, `--r-md 14px`, `--r-lg 22px`, `--r-pill 999px`. Tarjetas con borde 1 px `--line` y *highlight* superior.
- Breakpoints Tailwind por defecto; **diseñar mobile-first** (375 px como base), luego 768 / 1024 / 1440.

### 3.4 Tokens de movimiento (`src/lib/motion.ts`, espejo en CSS vars)
```
Duraciones:  fast 150ms · base 300ms · slow 600ms · hero 900–1200ms
Easings:     out-expo   cubic-bezier(.16,1,.3,1)    (entradas)
             in-out     cubic-bezier(.65,0,.35,1)   (transiciones de estado)
             spring UI  { stiffness: 260, damping: 28, mass: .9 }
             spring soft{ stiffness: 140, damping: 22 }
Stagger:     60–80ms entre hijos (máx. 8 elementos por grupo)
Reveal:      y: 24px → 0, opacity 0 → 1, once, margin de viewport -10%
Distancias:  nunca > 40px de desplazamiento en reveals
```

---

## 4. Mapa de reestructuración

### 4.1 Árbol destino
```
index.html                      lang dinámico, meta base, script anti-flash de tema, preload de fuentes
vercel.json                     redirects por Accept-Language, rewrites SPA, headers de caché/seguridad
public/
  favicon.svg, favicon.ico, apple-touch-icon.png, site.webmanifest
  og/es.png, og/en.png          imágenes OG 1200x630
  robots.txt                    (sitemap.xml se genera en el build)
  proyectos/<slug>/*.webp|avif  imágenes optimizadas (originales en /assets-src, fuera de public)
assets-src/proyectos/**         PNG originales (fuente para el script de optimización)
scripts/
  optimize-images.mjs           sharp: png → avif + webp, 3 anchos (480/960/1600), blur placeholder
  prerender-meta.mjs            genera dist/<ruta>/index.html + sitemap.xml
docs/
  AGREGAR_PROYECTO.md           receta de 5 pasos
src/
  main.tsx
  App.tsx                       providers + router
  routes.tsx                    tabla de rutas ES/EN (paths localizados)
  styles/
    index.css                   @import "tailwindcss"; @theme {tokens}; base; temas
    effects.css                 grano, glow, view-transitions
  config/
    site.ts                     nombre, dominio, email, WhatsApp, GitHub, LinkedIn (hoy hardcodeados en ContactPortal)
  i18n/
    index.ts                    init, detección, tipos
    paths.ts                    mapa de rutas localizadas
    locales/{es,en}/{common,home,projects,tech,seo}.json
  content/
    projects/
      index.ts                  registro + tipos (ProjectData)
      <slug>.ts                 datos neutros por proyecto (slug, order, featured, category, techs, links, images, year)
    technologies.ts             datos neutros; textos en locales/*/tech.json
  lib/
    cn.ts, motion.ts, gsap.ts (carga dinámica + registro de plugins), lenis.ts, seo.ts
  hooks/
    useTheme, useReducedMotion (OS + manual), useLocale, useMediaQuery, useInViewOnce, useActiveSection
  providers/
    ThemeProvider, MotionPrefsProvider, SmoothScrollProvider
  components/
    layout/   Navbar, MobileMenu, Footer, ScrollProgress, ThemeToggle, LangSwitch, IntroSequence, PageTransition, SkipLink
    ui/       Container, Button, MagneticButton, Chip, Reveal, SplitHeading, SectionHeading, Dialog (sobre <dialog> nativo), Toast
    hero/     InteractiveHeroGrid (+ .css)
    projects/ ProjectCarousel3D (+ .css), ProjectCard, ProjectGrid, ProjectFilters, Gallery, Lightbox, ProjectNav
    tech/     TechMap, TechNode, TechConnectors, TechDialog
    contact/  ContactPortal (+ .css), CurvedPortalText, PortalParticles, CopyEmail
  sections/   Hero, About, Projects, Technologies, Contact
  pages/      HomePage, ProjectsIndexPage, ProjectDetailPage, NotFoundPage
```

### 4.2 Mapeo archivo actual → destino

| Actual | Destino | Acción |
|---|---|---|
| `index.html` | `index.html` | Reescribir (lang, meta, tema anti-flash, preload) |
| `src/main.jsx`, `src/App.jsx` | `main.tsx`, `App.tsx`, `routes.tsx` | Migrar a TS + router + providers |
| `src/index.css` | `styles/index.css` | Reescribir como tokens Tailwind `@theme` |
| `src/App.css` | — | **Eliminar** (plantilla Vite); `.seccion-animada` → `ui/Reveal` |
| `components/Navbar/*` | `components/layout/Navbar`, `MobileMenu`, `useActiveSection` | **Rediseño**; scroll-spy pasa a `IntersectionObserver` |
| `components/SeccionAnimada` | `components/ui/Reveal` | Reemplazar (Motion `whileInView`, once, reduced-motion aware) |
| `components/SectionTitle` | `components/ui/SectionHeading` | Rediseñar: etiqueta mono numerada + título display con énfasis serif |
| `components/InteractiveHeroGrid/*` | `components/hero/InteractiveHeroGrid` | **Refinar** (ver §6.2). Conserva la lógica (`falloff`, `drawLight`, `applyCursorForces`, `applyAmbientWave`, `buildGrid`, `drawFrame`) |
| `components/ProyectoCard/*` | `components/projects/ProjectCard` | Rediseño |
| `components/ProyectoModal/*` (712 líneas CSS) | `pages/ProjectDetailPage` + `Gallery`/`Lightbox` | **Reemplazar** modal por página de detalle |
| `components/ContactPortal/*` | `components/contact/*` | **Refinar** (ver §6.6). Mover `WHATSAPP_URL`/`EMAIL_URL`/`GITHUB_URL` a `config/site.ts` |
| `sections/Inicio` | `sections/Hero` | Rediseño de layout, conserva el canvas |
| `sections/SobreMi` | `sections/About` | Rediseño a bento |
| `sections/Proyectos` (carrusel 3D, Pointer Events manuales) | `sections/Projects` + `ProjectCarousel3D` | **Refinar** (ver §6.4) |
| `sections/Tecnologias/*` | `sections/Technologies` + `components/tech/*` | **Refinar** el mapa de arquitectura; modal → `<dialog>` nativo |
| `sections/Contacto` | `sections/Contact` | Wrapper del portal + acciones secundarias |
| `sections/Footer` | `components/layout/Footer` | Rediseño |
| `data/proyectos.js` | `content/projects/<slug>.ts` + `locales/*/projects.json` | Separar datos neutros de textos traducibles. Corregir `c7.png` duplicado; `demo: "#"` → `null` (el botón se oculta) |
| `data/tecnologias.js` | `content/technologies.ts` + `locales/*/tech.json` | Idem |
| `public/proyectos/**` (PNG, 5.8 MB; 4 archivos > 500 KB) | `assets-src/proyectos/**` → `public/proyectos/<slug>/*.avif/.webp` | Optimizar con script |
| `src/assets/*`, `public/icons.svg` | — | Eliminar si no tienen referencias |

### 4.3 Modelo de datos de proyectos (escalable)

```ts
// content/projects/<slug>.ts  — datos neutros al idioma
export const consultorio: ProjectData = {
  slug: "consultorio-odontologico",
  order: 1,
  featured: true,                 // aparece en el carrusel del home
  category: "fullstack",          // "fullstack" | "backend" | "frontend"
  year: 2025,
  techs: ["react","node","express","mongodb"],   // slugs de technologies.ts
  links: { demo: null, code: "https://github.com/Agustcc99/ConsulAli" },
  cover: "consul/c2",
  images: [{ src: "consul/c2", altKey: "consultorio.img1" }, ...],
};
// locales/{es,en}/projects.json  → title, short, long, objective, features[], learnings[], alt text
```
**Agregar un proyecto = 1 archivo en `content/projects/` + 1 entrada en cada `projects.json` + carpeta de imágenes en `assets-src/` + `npm run images`.** Queda documentado en `docs/AGREGAR_PROYECTO.md`.
Regla de escalado: el carrusel muestra hasta 7 destacados; el índice `/proyectos` muestra todos con filtros por categoría y tecnología.

### 4.4 Rutas e idiomas
- Rutas localizadas: `/es`, `/es/proyectos`, `/es/proyectos/:slug` · `/en`, `/en/projects`, `/en/projects/:slug` (mapa en `i18n/paths.ts`).
- `/` redirige por `Accept-Language` en `vercel.json` (307) y, en desarrollo, por `navigator.language`. La elección manual se guarda en `localStorage`.
- IDs de ancla neutros en inglés: `#home #about #projects #tech #contact` (el scroll lo hace Lenis con `scrollTo`).
- `<html lang>` se actualiza por ruta; cada página lleva `hreflang` es/en/x-default.
- Cambiar de idioma conserva la ruta equivalente y la posición de scroll en el home.

---

## 5. Animaciones y comportamientos globales

| Pieza | Comportamiento | Tecnología |
|---|---|---|
| **Scroll suave** | `lerp ~0.1`, desactivado en táctil y con movimiento reducido; `scroll-padding-top` = alto del navbar | Lenis |
| **Barra de progreso** | 2 px arriba, color acento, `scaleX` ligada al scroll | Motion `useScroll` |
| **Intro** | ≤ 1.1 s, solo primera visita por sesión (`sessionStorage`), saltable con click/tecla, **no bloquea el LCP** (overlay que se retira); monograma "A" + wipe | GSAP timeline |
| **Transiciones de ruta** | Fade + leve desplazamiento del contenido; en detalle de proyecto, la portada hace *shared element* (portada de tarjeta → hero del detalle) | React Router `viewTransition` + `view-transition-name`; fallback fade |
| **Cambio de tema** | Revelado circular desde el botón | View Transitions API; fallback cross-fade |
| **Reveals de sección** | `Reveal` con stagger; títulos con máscara por palabra/línea | Motion / GSAP SplitText (hero y H2) |
| **Botones magnéticos** | Solo CTAs principales, solo `pointer: fine`, radio ≈ 80 px, máx. 8 px de desplazamiento | Motion `useSpring` |
| **Toggle de movimiento** | Interruptor visible en footer y menú; arranca según OS; persiste | `MotionPrefsProvider` |
| **Foco / teclado** | Anillo de foco acento 2 px con offset; skip-link; navegación completa por teclado | CSS |

**Reglas de rendimiento de animación:** solo `transform`/`opacity`; `will-change` aplicado y retirado en vida corta; canvas con DPR ≤ 2, pausa fuera de viewport y con pestaña oculta (patrón ya presente); ningún `scroll` listener sin `passive`; ScrollTrigger solo en el home y cargado dinámicamente.

---

## 6. Guía por componente

### 6.1 Navbar
- Diseño: **píldora flotante** centrada (borde `--line`, fondo `--surface-1/70` + `backdrop-blur`), se compacta al hacer scroll. Logo monograma "A" + `Agustín.dev`.
- Enlaces con indicador activo deslizante (`layoutId` de Motion) según sección visible (`IntersectionObserver`, reemplaza el cálculo por `offsetTop` en cada scroll).
- A la derecha: `LangSwitch` (ES | EN), `ThemeToggle`, CTA corto "Contacto/Contact".
- Mobile: botón hamburguesa → panel a pantalla completa con enlaces grandes en stagger, mismos controles; bloquea scroll; cierra con Escape y al navegar; focus trap.
- Se oculta al bajar y reaparece al subir (solo mobile).

### 6.2 Hero (conserva la animación que te gusta)
- Layout **a sangre completa**, `min-h-svh`; se elimina la tarjeta redondeada. La grilla de puntos ocupa todo el fondo con una máscara radial que se disuelve hacia los bordes y hacia la sección siguiente.
- **Refinamientos del canvas** (`InteractiveHeroGrid`): colores leídos de CSS vars (`getComputedStyle`) y relectura al cambiar de tema; DPR ≤ 2; recalcular grilla con `ResizeObserver` (no `resize` de ventana); mantener la ola ambiental en táctil y el fallback estático con movimiento reducido; `CONFIG` se conserva al tope del archivo y se tipa; un solo acento (puntos neutros que se encienden en acento).
- Contenido: chip de estado con punto pulsante ("Disponible para proyectos" / "Open to work" — *confirmar texto*), H1 display con **una palabra en Instrument Serif itálica**, párrafo corto (≤ 2 líneas), dos CTAs (principal magnético "Ver proyectos", secundario "Contacto"), indicador de scroll sutil. Tira opcional de 3 datos en mono (`2 años · 7 proyectos · React / Node / MongoDB`).
- Coreografía de entrada (GSAP): chip → H1 por palabras con máscara (SplitText) → párrafo → CTAs → grilla se "enciende" desde el centro. Re-ejecutable al cambiar de idioma (re-split).
- Copy: más corto que el actual; ES y EN escritos a la vez (revisión tuya al final de la Fase 5).

### 6.3 Sobre mí → **Bento grid**
- 6 teselas de tamaños distintos: *Quién soy* (grande), *Qué busco*, *Cómo trabajo*, *Stack principal* (chips mono), *Cocina → Código* (tu perfil gastronómico como relato diferenciador), *Disponibilidad / Ubicación* (**pendiente de tus datos**).
- Texto actual (denso) se condensa a 2–3 líneas por tesela; el detalle largo se conserva en la tesela grande.
- Animación: reveal escalonado; hover con *spotlight* que sigue al puntero dentro de la tesela (gradiente radial con CSS vars, sin JS pesado).

### 6.4 Proyectos

**Home — carrusel 3D (conserva y refina)**
- Mantiene el *coverflow* con perspectiva y arrastre. Constantes de tuning al tope (`ANCHO_SLOT_POR_DEFECTO`, `PASO_RATIO`, `ROTACION_MAXIMA`, etc.) se conservan tipadas.
- Mejoras: inercia con spring (Motion `animate`) en lugar de transición manual; teclado (←/→, Home/End); rueda/trackpad horizontal; *snap* al soltar; puntos de paginación + flechas; contador `03 / 07` en mono; semántica ARIA de carrusel (`role="region"`, `aria-roledescription="carousel"`, slides con `aria-label="n de N"`); `inert` en slides no activos; imágenes con `loading="lazy"`, `sizes` y placeholders blur; sin autoplay.
- Solo se renderizan con coste completo los slots cercanos al activo.
- Tarjeta: portada, categoría (chip neutro), título, 1 línea, hasta 4 chips de tecnología, CTA "Ver caso / View case" → ruta de detalle (ya no abre modal).
- Debajo: enlace "Ver todos los proyectos (N)" → `/proyectos`.

**`/proyectos` — índice**
- Grilla responsive con filtros por categoría y tecnología (chips; animación `layout` de Motion al filtrar); estado de filtros en query string (`?cat=fullstack`).
- Pensado para crecer: paginación o "cargar más" solo si se superan ~18 proyectos.

**`/proyectos/:slug` — detalle**
- Hero con portada (transición compartida), título, resumen, riel de metadatos (rol, año, stack, enlaces demo/código — cada botón se oculta si el enlace es `null`).
- Secciones: Objetivo, Descripción, Funcionalidades, Aprendizajes; **galería** con lightbox accesible (`<dialog>`, teclado, swipe).
- Navegación "Anterior / Siguiente proyecto" al pie. Metadatos OG propios (portada del proyecto).

### 6.5 Tecnologías
- Se conserva el **mapa de arquitectura**: 4 categorías (interfaz / lógica / datos / entrega) con conectores SVG entre ellas, orden distinto en mobile (breakpoint 640 px).
- Refinamientos: nodos con el nuevo sistema (borde, número mono `01–04`, un solo acento); conectores se **dibujan** al entrar en viewport (`pathLength` / DrawSVG de GSAP) y se iluminan al hover/foco; el "pulso" único a los 2 s se conserva pero ligado al viewport.
- Chip de tecnología → abre `TechDialog` sobre `<dialog>` nativo (focus trap y Escape gratis; se elimina el focus trap manual). Contenido: nivel (marcador de 3 pasos), "usado para", funcionalidades, proyectos relacionados (enlazan a las páginas de detalle).
- Evaluar íconos de marca (SVG inline tree-shaken) para los chips; decisión en Fase 8.

### 6.6 Contacto (conserva el portal y lo refina)
- Se mantiene el portal animado con halos SVG, texto curvado y partículas.
- Refinamientos: colores desde tokens y reacción al cambio de tema; texto curvado traducible (ES/EN); **un solo loop rAF** para halos + partículas, pausado fuera de viewport; cantidad de partículas escalada por tipo de dispositivo; interacción `coarse pointer` revisada (toque = abrir portal); `prefers-reduced-motion` → versión estática con el mismo CTA.
- Acciones secundarias bajo el portal: **copiar email** (con toast "Copiado"), GitHub, LinkedIn (*si existe, pendiente*), todas desde `config/site.ts`.
- Sin formulario (no hay backend).

### 6.7 Footer
- Mínimo: monograma, navegación corta, enlaces sociales, `ThemeToggle`/`LangSwitch`/toggle de movimiento, "Volver arriba" con scroll suave, © con año dinámico y nota de stack.

### 6.8 Página 404
- En el mismo sistema de diseño, con enlace de vuelta en el idioma detectado.

---

## 7. Rendimiento, SEO y accesibilidad (reglas transversales + Fase 11)

**Metas medibles (Lighthouse, build de producción)**
- Mobile: Performance ≥ 90 · Desktop ≥ 95 · Accessibility ≥ 95 · Best Practices ≥ 95 · SEO 100.
- LCP < 2.0 s · CLS < 0.05 · INP < 200 ms.
- JS inicial ≤ ~200 KB gzip; GSAP, página de detalle y lightbox por *code-splitting*.

**Checklist**
- [ ] Imágenes AVIF/WebP en 3 anchos + `srcset`/`sizes`, `width`/`height` explícitos, `loading="lazy"` (salvo portada LCP con `fetchpriority="high"`).
- [ ] Fuentes self-hosted, subconjunto latín + latín extendido, `preload` de las críticas, `font-display: swap`, ajuste de métricas del fallback para evitar CLS.
- [ ] `<html lang>` correcto, `title` y `description` por ruta e idioma, canonical, `hreflang`, OG/Twitter, JSON-LD (`Person` + `WebSite`), `sitemap.xml`, `robots.txt`, favicon set + manifest.
- [ ] Un solo `<h1>` por página; jerarquía de encabezados; landmarks; skip-link.
- [ ] Contraste AA en ambos temas; foco visible; todo operable por teclado; `aria-label` traducidos; `prefers-reduced-motion` + toggle manual.
- [ ] Sin layout shift por intro, fuentes o imágenes.
- [ ] `vercel.json`: caché inmutable para `/assets/*` y `/proyectos/*`, rewrites SPA, headers de seguridad (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP razonable).
- [ ] Analítica opcional (Vercel Analytics, sin cookies) — *decisión tuya en Fase 12*.

---

## 8. Roadmap de ejecución (sesiones de Claude Code)

**Convenciones para todas las fases**
- Rama de trabajo: `rediseno` (crear en Fase 0). Un commit (o pocos) por fase, con mensaje `fase N: …`.
- **No commitear** `.claude/launch.json` ni `.claude/run-amor-v2.cmd` (pertenecen a otro proyecto, tienen cambios previos sin relación).
- Verificación estándar al cerrar cada fase:
  ```bash
  npm run lint && npm run typecheck && npm run build
  ```
  y revisión visual con el servidor `portfolio-dev` (puerto 5173, definido en `.claude/launch.json`) en **375 / 768 / 1280 / 1920 px**, **ambos temas**, **ambos idiomas**; consola sin errores; sin scroll horizontal.
- Cada fase lista **Tareas**, **Entregables** y **Criterio de salida**. Si algo falla el criterio, se corrige antes de seguir.
- Al terminar la Fase 12, ejecutar `/save-context` para regenerar `.claude/context/PROJECT_MAP.md`.

### Sugerencia de agrupación en sesiones
| Sesión | Fases | Objetivo |
|---|---|---|
| A | 0 – 2 | Limpieza, fundaciones, i18n y contenido |
| B | 3 – 4 | Infraestructura de animación y shell (navbar/footer/temas) |
| C | 5 – 6 | Hero y Sobre mí |
| D | 7 | Proyectos (la más grande) |
| E | 8 – 9 | Tecnologías y Contacto |
| F | 10 – 12 | Pulido, QA y despliegue |

---

### Fase 0 — Preparación y limpieza
**Tareas**
- [x] Verificar `git status` limpio salvo los 2 archivos ajenos; crear rama `rediseno`.
- [x] `npm run build` y `npm run lint` de línea base; anotar tamaño de `dist` y errores preexistentes.
- [x] Capturas "antes" del sitio actual (375/1280) en `docs/antes/` (para comparar).
- [x] Eliminar `bootstrap` y `lucide` (verificar con grep que no se usan).
- [x] Borrar el CSS de plantilla de `App.css` y assets sin referencias (`hero.png`, `react.svg`, `vite.svg`, `public/icons.svg`).
- [x] Mover PNG originales a `assets-src/proyectos/` (git los sigue trackeando; `public/` queda para los optimizados).
- [x] Corregir datos: `c7.png` duplicado en el proyecto 1. Normalizar nombres de imagen a minúsculas (hoy mezclan `Vl4.png`/`VL5.png`, `T1.png`/`t2.png`); las referencias actuales coinciden con los archivos, pero Vercel corre en Linux (sensible a mayúsculas) y cualquier renombrado a medias rompe imágenes.

> **Línea base (2026-10-26):** `dist` 6.2 MB (JS 245.9 KB / 77.1 KB gzip, CSS 48.5 KB / 9.2 KB gzip). Lint previo: 1 error (`react-hooks/refs` en `Proyectos.jsx`, desaparece al reescribir el carrusel en Fase 7) + 2 warnings (`Navbar.jsx`, `SeccionAnimada.jsx`, se reescriben en Fases 3–4). Originales copiados a `assets-src/proyectos/` (minúsculas); `public/proyectos/` conserva los PNG hasta que la Fase 2 genere los optimizados y los reemplace.

**Criterio de salida:** build verde, sitio visualmente idéntico al de antes, rama creada, commit `fase 0`. ✅

### Fase 1 — Fundaciones: TypeScript + Tailwind + tokens + temas
**Tareas**
- [ ] Instalar `typescript`, `typescript-eslint`, tipos; `tsconfig` estricto; renombrar `.jsx/.js` → `.tsx/.ts` por lotes con `allowJs` temporal; scripts `typecheck`.
- [ ] Instalar Tailwind v4 + `@tailwindcss/vite`; crear `styles/index.css` con `@theme` (colores §3.1, tipografía §3.2, radios, easings).
- [ ] Temas: `data-theme` en `<html>`, script inline anti-flash en `index.html`, `ThemeProvider` + `useTheme`, `ThemeToggle` provisional.
- [ ] Instalar y cargar fuentes `@fontsource`; base tipográfica y escala fluida.
- [ ] `Container`, `Button`, `Chip`, `cn()`.
- [ ] Página dev-only `/__styleguide`: paleta (ambos temas) con ratios de contraste, escala tipográfica, botones, chips, y **comparador de tipografías y de acento** para validar o ajustar las decisiones de §3.
- [ ] Eliminar `#root` de 1180 px y los gradientes neón del `body`.

**Criterio de salida:** styleguide aprobado visualmente por Agustín (tipografía y acento confirmados), tema sin parpadeo al recargar, `typecheck` verde.

### Fase 2 — i18n, rutas y modelo de contenido
**Tareas**
- [ ] `react-router`, rutas localizadas (§4.4), redirect `/` provisional por `navigator.language`, `NotFoundPage`.
- [ ] `i18next` + `react-i18next` con recursos tipados, carga por idioma, `LangSwitch` provisional, `<html lang>` dinámico.
- [ ] `config/site.ts` (extraer enlaces hardcodeados de `ContactPortal`).
- [ ] Separar `proyectos.js` y `tecnologias.js` en datos neutros + `locales/{es,en}`. **Traducir todo el contenido al inglés** (borrador de Claude, revisión de Agustín).
- [ ] Páginas vacías `HomePage`, `ProjectsIndexPage`, `ProjectDetailPage` que renderizan datos crudos (sin diseño final).
- [ ] Script `optimize-images.mjs` + `npm run images`; generar `public/proyectos/<slug>/…`.
- [ ] `docs/AGREGAR_PROYECTO.md`.

**Criterio de salida:** navegar `/es` ↔ `/en` y a un detalle funciona con datos reales; imágenes optimizadas generadas; build verde.

### Fase 3 — Infraestructura de animación
**Tareas**
- [ ] `MotionPrefsProvider` (OS + toggle manual persistido) y `useReducedMotion` único para toda la app.
- [ ] `SmoothScrollProvider` (Lenis) con sincronización a `gsap.ticker`/ScrollTrigger; desactivado en táctil y movimiento reducido; `scrollTo` por ancla.
- [ ] `lib/motion.ts` (tokens §3.4, variantes reutilizables) con `LazyMotion`.
- [ ] `lib/gsap.ts` con carga dinámica y registro de ScrollTrigger/SplitText; helper con `gsap.context` y cleanup.
- [ ] `Reveal`, `SplitHeading`, `ScrollProgress`, `MagneticButton`.
- [ ] Sección de pruebas en `/__styleguide` para cada animación.

**Criterio de salida:** todas las primitivas funcionan y se desactivan correctamente con movimiento reducido; sin fugas (verificar remount repetido); GSAP no entra al bundle inicial.

### Fase 4 — Shell: Navbar, MobileMenu, Footer, Intro, transiciones
**Tareas**
- [ ] `Navbar` píldora + `useActiveSection` con IntersectionObserver + `MobileMenu` accesible.
- [ ] `LangSwitch` y `ThemeToggle` definitivos (revelado circular con View Transitions).
- [ ] `Footer` (§6.7), `SkipLink`.
- [ ] `IntroSequence` (§5) y `PageTransition` de rutas.
- [ ] Grano/glow de fondo (`effects.css`).

**Criterio de salida:** navegación completa por teclado y táctil; menú mobile sin fallos de scroll-lock; intro saltable y sin impacto en LCP.

### Fase 5 — Hero
**Tareas**
- [ ] Rediseño a sangre completa (§6.2) conservando `InteractiveHeroGrid`; refactor del canvas (CSS vars, `ResizeObserver`, tipado).
- [ ] Coreografía de entrada con GSAP y re-split al cambiar idioma.
- [ ] Copy ES/EN final (revisión de Agustín).
- [ ] Medir 60 fps / CPU del canvas en mobile emulado.

**Criterio de salida:** hero aprobado en ambos temas e idiomas; canvas pausa fuera de viewport; movimiento reducido = versión estática equivalente.

### Fase 6 — Sobre mí (bento)
**Tareas**
- [ ] `SectionHeading` definitivo; bento de 6 teselas (§6.3); contenido ES/EN; spotlight en hover.
- [ ] Datos pendientes de Agustín: disponibilidad, ubicación, texto de "Cocina → Código".

**Criterio de salida:** layout correcto de 375 a 1920 px; textos condensados aprobados.

### Fase 7 — Proyectos
**Tareas**
- [ ] `ProjectCarousel3D` (refinar el actual según §6.4: spring, teclado, ARIA, lazy).
- [ ] `ProjectCard` nuevo; sección Proyectos del home con enlace al índice.
- [ ] `ProjectsIndexPage` con filtros y query string.
- [ ] `ProjectDetailPage` + `Gallery` + `Lightbox` (`<dialog>`) + navegación anterior/siguiente.
- [ ] Transición compartida portada → detalle con fallback.
- [ ] Eliminar `ProyectoModal` y su CSS (712 líneas).
- [ ] Probar agregando un proyecto de prueba siguiendo `AGREGAR_PROYECTO.md` (y luego quitarlo).

**Criterio de salida:** los 7 proyectos navegables en ambos idiomas; carrusel usable con mouse, táctil y teclado; añadir un proyecto de prueba funciona con 5 pasos o menos.

### Fase 8 — Tecnologías
**Tareas**
- [ ] `TechMap` con nodos/conectores del nuevo sistema; dibujo de conectores en scroll; orden mobile.
- [ ] `TechDialog` sobre `<dialog>`; enlaces a proyectos.
- [ ] Decidir y, si corresponde, integrar íconos de marca (tree-shaken).

**Criterio de salida:** todas las tecnologías abren su ficha con foco correcto y Escape; sin regresiones de datos respecto de `tecnologias.js`.

### Fase 9 — Contacto
**Tareas**
- [ ] Refactor de `ContactPortal` (§6.6): tokens/tema, loop único, traducción del texto curvado, fallback de movimiento reducido.
- [ ] `CopyEmail` + `Toast`; enlaces desde `config/site.ts`.

**Criterio de salida:** CTA a WhatsApp funcional en mobile y desktop; portal fluido en mobile emulado; reduced-motion verificado.

### Fase 10 — Pulido de movimiento
**Tareas**
- [ ] Revisión transversal: tiempos, easings, stagger y consistencia entre secciones.
- [ ] Micro-interacciones (hover/focus/press) en todos los elementos interactivos.
- [ ] Eliminar animaciones sobrantes que no aporten; confirmar que nada anima propiedades de layout.
- [ ] Página 404 final.

**Criterio de salida:** recorrido completo sin saltos ni jank; revisión de Agustín del "feel".

### Fase 11 — Rendimiento, SEO y accesibilidad
**Tareas**
- [ ] `scripts/prerender-meta.mjs` + `sitemap.xml` + JSON-LD; OG images ES/EN y por proyecto.
- [ ] `vercel.json` (redirects por idioma, rewrites, headers, caché).
- [ ] Auditoría Lighthouse (mobile y desktop) de home, índice y detalle; corregir hasta cumplir §7.
- [ ] Auditoría de accesibilidad (axe, teclado, lector de pantalla básico, contraste en ambos temas).
- [ ] Revisar bundle (`vite build` + analizador) y dividir lo necesario.

**Criterio de salida:** metas de §7 cumplidas; previews de enlaces (WhatsApp/LinkedIn) correctos en ES y EN.

### Fase 12 — Despliegue en Vercel + dominio
**Tareas**
- [ ] Subir el repo a GitHub (si no está), conectar a Vercel, framework "Vite".
- [ ] Variables/ajustes: dominio canónico en `config/site.ts` y en el prerender.
- [ ] Agregar el dominio propio en Vercel y configurar DNS (registro A/CNAME que indique Vercel); redirigir `www` ↔ apex; HTTPS.
- [ ] Probar redirect por `Accept-Language`, rutas profundas (refresco en `/en/projects/<slug>`) y 404.
- [ ] Decidir analítica (opcional).
- [ ] Actualizar `README.md` (stack, comandos, cómo agregar proyectos) y regenerar `PROJECT_MAP.md` con `/save-context`.
- [ ] Merge de `rediseno` a `main`.

**Criterio de salida:** sitio en producción en el dominio propio, ambos idiomas, Lighthouse de producción dentro de metas.

---

## 9. Pendientes que necesito de Agustín (se resuelven durante la ejecución)

| Dato | Se necesita en |
|---|---|
| Dominio propio (nombre exacto) | Fase 11–12 (se puede usar placeholder antes) |
| Texto/estado de disponibilidad ("Disponible para proyectos", etc.) | Fase 5 |
| Ubicación y datos para la tesela de disponibilidad | Fase 6 |
| Texto del relato "Cocina → Código" | Fase 6 |
| URL de LinkedIn (¿existe?) y de CV (¿se incluye?) | Fase 9 |
| URLs reales de demo de los proyectos con `demo: "#"` | Fase 2 / 7 |
| Revisión de las traducciones al inglés | Fases 2, 5, 6 |
| Confirmación del acento lima tras verlo en pantalla | Fase 1 |
| ¿Analítica? | Fase 12 |

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Convivencia GSAP + Motion + Lenis (conflictos de scroll/transform) | Reglas de §1.2; primitivas centralizadas en la Fase 3 con pruebas en el styleguide |
| Rendimiento del canvas y el portal en mobile | Presupuesto de partículas por dispositivo, DPR ≤ 2, pausa fuera de viewport, medición en la Fase 5 y 9 |
| TS 7 / typescript-eslint / plugin de React incompatibles | Verificar al instalar; usar la última 5.x/6.x si hay fricción |
| Nombres de imagen con mayúsculas mezcladas (`Vl4.png`, `VL5.png`, `T1.png`/`t2.png`) pueden romperse en Vercel (Linux, sensible a mayúsculas) si se renombra a medias | Normalizar todo a minúsculas en la Fase 0 y que el script de imágenes use slugs |
| Traducciones de baja calidad | Borrador de Claude + revisión tuya antes de cerrar cada sección |
| View Transitions no soportadas en algún navegador | Fallbacks definidos (fade / cross-fade) |
| Scope creep del "nivel alto" de animación | Fase 10 es explícitamente de recorte y consistencia |

---

## 11. Prompt de arranque para cada sesión futura

> Lee `plan_actualizacion_portafolio.md` completo. Estamos en la **Fase N** (y N+1). Ejecutá solo las tareas de esas fases, en orden, siguiendo las convenciones de §8 y el sistema de diseño de §3. Al terminar, corré la verificación estándar, mostrame capturas (375/1280, ambos temas e idiomas), tildá las tareas completadas en este archivo, hacé el commit de fase y detenete para mi aprobación antes de seguir.
