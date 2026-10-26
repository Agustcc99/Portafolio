# Seguimiento del rediseño del portafolio

> Documento vivo. **Al abrir una conversación nueva:** leé este archivo y luego `plan_actualizacion_portafolio.md` (§8 en adelante para la fase que toca). **Al cerrar una sesión:** actualizá §1, §3, §4 y §6.
> Última actualización: 2026-10-26 (cierre de la sesión E).

---

## 1. Estado actual

| Fase | Descripción | Estado | Commit |
|---|---|---|---|
| 0 | Preparación y limpieza | ✅ Completa | `9a5a0f1` |
| 1 | TypeScript + Tailwind + tokens + temas | ✅ Completa · ⏳ falta aprobación visual de Agustín | `4ab2798` |
| 2 | i18n, rutas y modelo de contenido | ✅ Completa | `20b3712` |
| 3 | Infraestructura de animación | ✅ Completa · ⏳ falta revisión visual de Agustín | `fase 3-4` |
| 4 | Shell: navbar, footer, intro, transiciones | ✅ Completa · ⏳ falta revisión visual de Agustín | `fase 3-4` |
| 5 | Hero | ✅ Completa · ⏳ falta aprobación visual y de copy de Agustín | `fase 5-6` |
| 6 | Sobre mí (bento) | ✅ Completa · ⏳ faltan datos y textos de Agustín | `fase 5-6` |
| 7 | Proyectos | ✅ Completa · ⏳ falta revisión visual del movimiento de Agustín | `fase 7` |
| 8 | Tecnologías | ✅ Completa · ⏳ falta revisión visual del movimiento de Agustín | `fase 8-9` |
| 9 | Contacto | ✅ Completa · ⏳ falta revisión visual y datos de Agustín | `fase 8-9` |
| 10 | Pulido de movimiento | ⬜ | — |
| 11 | Rendimiento, SEO y accesibilidad | ⬜ | — |
| 12 | Despliegue en Vercel + dominio | ⬜ | — |

**Sesiones:** A (0–2) ✅ · B (3–4) ✅ · C (5–6) ✅ · D (7) ✅ · E (8–9) ✅ · **F (10–12) ← siguiente**.

**Rama:** `rediseno` (7 commits sobre `main`, sin pushear). `main` sigue en `2dfd0df`.
**No commitear nunca:** `.claude/launch.json` y `.claude/run-amor-v2.cmd` (son de otro proyecto).

---

## 2. Cómo retomar (sesión F)

Prompt de arranque (del plan §11):

> Lee `plan_actualizacion_portafolio.md` y `docs/SEGUIMIENTO_REDISENO.md` completos. Estamos en la **Fase 10** (y 11, 12). Ejecutá solo las tareas de esas fases, en orden, siguiendo las convenciones de §8 y el sistema de diseño de §3. Al terminar, corré la verificación estándar, mostrame capturas (375/1280, ambos temas e idiomas), tildá las tareas completadas en el plan, hacé el commit de fase y detenete para mi aprobación antes de seguir.

Comandos:

```bash
git checkout rediseno
npm run lint && npm run typecheck && npm run build   # verificación estándar
npm run i18n:check                                    # paridad de claves ES/EN
npm run images                                        # regenera imágenes optimizadas
npm run dev                                           # servidor "portfolio-dev", puerto 5173
```

Rutas útiles: `/es`, `/en`, `/es/proyectos`, `/en/projects/<slug>`, `/__styleguide` (solo dev).
Verificación visual: 375 / 768 / 1280 / 1920 px, ambos temas, ambos idiomas, consola limpia, sin scroll horizontal.

---

## 3. Qué existe hoy (mapa rápido)

```
src/
  main.tsx / App.tsx / routes.tsx     BrowserRouter (react-router 8.5), rutas ES/EN
  config/site.ts                      email, WhatsApp, GitHub, dominio (placeholder)
  i18n/                               index.ts (carga por idioma), paths.ts, i18next.d.ts, locales/{es,en}/{common,home,projects,tech,seo}.json
  content/
    projects/<slug>.ts                7 proyectos (export default, autoregistro con import.meta.glob)
    projects/images.generated.json    generado por `npm run images`
    technologies.ts                   etiquetas, categorías, niveles, relaciones
    images.ts                         helper srcset/blur
  providers/ThemeProvider.tsx         tema oscuro/claro, persiste en localStorage('theme')
  hooks/useTheme.ts, useContentText.ts
  components/ui/                      Container, Button(+buttonClasses), Chip, ProjectImage
  components/layout/                  ThemeToggle, LangSwitch, LocaleLayout (barra flotante PROVISIONAL)
  pages/                              HomePage, ProjectsIndexPage, ProjectDetailPage, NotFoundPage, Styleguide (dev)
  styles/index.css, effects.css       @theme con tokens; fondo, menú, view transitions, diálogos
scripts/optimize-images.mjs, check-i18n.mjs
assets-src/proyectos/**               PNG originales (fuente)
public/proyectos/**                   AVIF + WebP generados
docs/AGREGAR_PROYECTO.md, docs/antes/ capturas del sitio original
```

Fases 3–4 (nuevo):
```
src/lib/            motion.ts (tokens/variantes), gsap.ts (carga dinámica, useGsapContext, enlace Lenis), viewTransition.ts, cn.ts (twMerge con escala tipográfica propia)
src/providers/      MotionPrefsProvider (LazyMotion+MotionConfig+data-motion), SmoothScrollProvider (Lenis, scrollTo, lock/unlock)
src/hooks/          useReducedMotion/useMotionPrefs, useSmoothScroll/useScrollLock, useMediaQuery, useActiveSection
src/components/ui/  Reveal(+RevealGroup), SplitHeading, ScrollProgress, MagneticButton
src/components/layout/  Navbar, MobileMenu(<dialog>), Footer, SkipLink, IntroSequence, PageTransition, ScrollManager, SiteBackground, SiteLink, ThemeToggle, LangSwitch, MotionToggle, Monogram, navItems
src/styles/effects.css  fondo, menú móvil, view transitions, movimiento reducido manual
src/pages/styleguide/MotionLab.tsx   pruebas de animación (/__styleguide §06)
```
Fases 5–6 (nuevo):
```
src/components/hero/InteractiveHeroGrid.tsx(+.css)   canvas tipado, colores desde CSS vars, máscara con --reveal
src/sections/Hero/Hero.tsx, src/sections/About/About.tsx   (ids home / about)
src/components/ui/SectionHeading.tsx, BentoTile.tsx
src/lib/intro.ts    introDone / markIntroDone: las coreografías esperan a la intro
src/pages/HomePage.tsx   <main> con las cinco secciones nuevas (Hero, About, Projects, Technologies, Contact); ya no hay diseño legacy
```
Fase 7 (nuevo):
```
src/components/projects/   ProjectCarousel3D(+.css, spring de Motion), ProjectCard, ProjectGrid, ProjectFilters, Gallery, Lightbox(<dialog>), ProjectNav, CoverPlaceholder
src/sections/Projects/Projects.tsx   id projects: carrusel con featuredProjects + "Ver todos (N)"
src/pages/ProjectsIndexPage.tsx (filtros ?cat=&tech=), ProjectDetailPage.tsx
src/lib/sharedCover.ts   nombre de view-transition `project-cover` en una sola portada por página
src/components/ui/chipClasses.ts   clases de chip (Chip y chips-botón de filtros)
```
Fases 8–9 (nuevo):
```
src/components/ui/Dialog.tsx   <dialog> modal nativo: scroll lock (Lenis), clic en fondo (data-dialog-backdrop), fundido (.dialog-fade en effects.css); lo usan Lightbox y TechDialog
src/components/tech/   TechMap(+.css), TechNode, TechConnectors (SVG con pathLength), TechDialog
src/sections/Technologies/Technologies.tsx   id tech
src/components/contact/   ContactPortal(+.css, un solo rAF), particleField.ts (dibujo sin bucle propio), CopyEmail
src/providers/ToastProvider.tsx (+toast-context), src/hooks/useToast.ts
src/sections/Contact/Contact.tsx   id contact (portal + copiar email + GitHub [+ LinkedIn si site.linkedin])
```
Providers en `main.tsx`: Theme → MotionPrefs → SmoothScroll → Toast → BrowserRouter. Shell en `LocaleLayout`.

---

## 4. Decisiones y desvíos respecto del plan

| Tema | Plan | Realidad | Motivo |
|---|---|---|---|
| TypeScript | 7.x o última 5.x/6.x | **6.0.3** | `typescript-eslint` 8.72 exige `<6.1` |
| React | 19 | **19.3.1** | `react-router@8.5` exige ≥ 19.2.7 |
| Router | `react-router` o `-dom` | **`react-router` 8.5** | paquete único; Node ≥ 22.22 (hay 24.11) |
| Migración a TS | completa en Fase 1 | **parcial** (`allowJs`) | los `.jsx` grandes se reescriben en fases 5–9; migrarlos antes es trabajo tirado |
| `--muted` | `#6B6B76` / `#8A8A94` | `#80808B` / `#6A6A74` | no cumplían AA (3.4:1 y 2.9:1) |
| Acento en tema claro | relleno lima | foco/indicadores usan `--accent-text` | lima sobre `#F6F5F0` = 1.38:1 |
| Fuentes | Bricolage variable con `wdth`/`opsz` | solo eje `wght` | menos peso; se puede ampliar |
| Imágenes de proyecto | `{src, altKey}` | strings `carpeta/archivo` + alt generado | alt genérico "Captura N de {título}" |
| Registro de proyectos | archivo + entrada en `index.ts` | **autoregistro** con `import.meta.glob` | un paso menos |
| `year` de proyectos | ej. 2025 | opcional, vacío | no hay datos reales |
| Categoría "Maquetación" | — | `frontend` (ES "Maquetación", EN "Front-end markup") | |
| Idioma del home | ES + EN | **solo ES** hasta reescribir cada sección | `home.json` ES/EN ya existe |
| Indicador del navbar | `layoutId` de Motion | igual, con features `domMax` en chunk aparte | `layoutId` exige `domMax` (29 KB gzip, lazy) |
| Navbar de escritorio | visible en `md` | visible desde **`lg` (1024)**; debajo, menú móvil | con 5 enlaces + controles no entra en 768 |
| Menú móvil | panel + focus trap manual | **`<dialog>` modal nativo** con transiciones CSS | foco, Escape e inert gratis |
| Transición de ruta | `viewTransition` de React Router | **`document.startViewTransition` propio** (`transitionRoute`) | `BrowserRouter` declarativo no soporta `viewTransition`; fallback = fade con Motion |
| Cambio de idioma | navegar y luego cambiar texto | precarga bundle → `activateLanguage` + `navigate` en el mismo render dentro de la view transition | evita parpadeo y conserva scroll |
| Enlace Lenis↔GSAP | `gsap.ticker` | `lenis.on('scroll', ScrollTrigger.update)` (Lenis con su propio rAF) | más simple; GSAP puede cargar antes o después |
| Hero: «se enciende desde el centro» | animar el canvas | se anima `--reveal` de la máscara CSS del contenedor (GSAP) | evita tocar el bucle de dibujo |
| Hero: luces del canvas | acento + violeta | **solo acento** (dos radios) | un solo acento (plan §3.1) |
| Bento: ubicación | tesela «Disponibilidad / Ubicación» | solo disponibilidad (sin ubicación) | no hay dato real |
| Stack tile | chips del stack | JavaScript, React, Node.js, Express, MongoDB, Git (de `techLabels`) | «principales» según el texto del sitio |
| Proyectos: destacados | `featured` solo en algunos | **los 7 en `featured: true`** | el sitio original mostraba los 7 en el carrusel (el flag era solo un badge); el tope pasó a `MAX_FEATURED = 7` en `content/projects/index.ts` |
| Carrusel: inercia | transición manual | `position` continuo con `useSpring` de Motion; arrastre con `jump`, al soltar se proyecta la velocidad (máx. 2 slides por gesto) y se hace snap | sin re-render por frame: la pose de cada slot sale de `useTransform` |
| Carrusel: coste | solo slots cercanos | slots a más de 3 del activo no montan la tarjeta | máx. 7 slots, pero escala |
| Carrusel: controles | flechas laterales + puntos | contador mono, puntos y flechas abajo; flechas con `aria-disabled` (no pierden el foco) | mobile: puntos arriba, contador y flechas abajo |
| Carrusel: slides inactivos | `inert` | `inert` en el contenido y `aria-hidden` en el slot; el slot (no inert) recibe el clic que lo centra | |
| Tarjeta | CTA "Ver caso" | enlace estirado sobre el título (un enlace por tarjeta, nombre accesible = título) | evita 7 enlaces "Ver caso" idénticos para lectores de pantalla |
| Detalle: riel de metadatos | rol, año, stack, enlaces | categoría, año (si existe), stack, enlaces; **sin rol** | no hay dato de rol; el año tampoco existe aún (se oculta) |
| Detalle: galería | — | muestra desde la 2ª captura (la portada ya está en el hero; clic en el hero abre el lightbox en la 1ª) | evita duplicar la imagen |
| Proyecto sin capturas (`api-ecommerce`) | — | `CoverPlaceholder` (trama + categoría en serif) en tarjeta y hero; sin galería | no tenía imágenes |
| Transición compartida | `view-transition-name` por proyecto | nombre único `project-cover` puesto solo en la portada que viaja (`lib/sharedCover.ts`) | los nombres deben ser únicos en cada captura; con 7 nombres las otras portadas se animarían solas |
| `ScrollManager` | scroll a 0 al navegar a la misma ruta | si solo cambia la query (filtros) no mueve el scroll | filtrar no debe saltar al tope |
| `ProjectImage` | — | prop `pictureClassName` | el `<picture>` es inline y rompía `size-full` |
| Íconos de marca en los chips (plan §6.5) | evaluar y decidir | **no se integran** | `lucide-react` no trae marcas; `simple-icons` sumaría una dependencia, ~20 glifos en el bundle inicial y le faltan marcas retiradas por trademark (p. ej. AWS, Java); además logos de marca rompen la regla de un solo acento. Chips tipográficos (mono) son coherentes con el sistema. Se puede revisar en la Fase 10 |
| Mapa de tecnologías: orden | DOM distinto en móvil y escritorio | un solo orden de DOM (flujo interfaz → lógica → datos → entrega) y `grid-template-areas` por breakpoint | el orden de tabulación sigue el flujo en la "U" de escritorio y en la columna móvil, sin duplicar markup |
| Mapa: conectores | `pathLength`/DrawSVG de GSAP | SVG con `pathLength=1` + `stroke-dashoffset` por CSS, disparado con `useInView` de Motion | sin GSAP en la sección; sin fugas que limpiar |
| `TechDialog` | `<dialog>` nativo | sobre `ui/Dialog`; el contenido persiste durante el fundido de salida (`selected.open`) | evita que el panel se vacíe al cerrar |
| `Lightbox` | `<dialog>` propio | pasa a usar `ui/Dialog` | evita duplicar scroll lock, fundido y clic en fondo |
| Portal: «texto curvado» (`CurvedPortalText`) | texto curvado traducible | se conservan las **palabras flotantes** del portal original, ahora traducidas (`home.json` → `contact.words`) | el portal actual no tenía texto sobre un arco; reemplazarlo cambiaba la pieza firma. Si querés el arco, es un componente aparte |
| Portal: bucle | un solo rAF para halos + partículas | un solo rAF para líneas, palabras, halo, botón magnético **y** partículas (`particleField.ts` solo dibuja) | pausa única fuera de pantalla / pestaña oculta |
| Portal: colores | tokens y reacción al tema | halo, anillos, líneas y botón con `color-mix` sobre `--accent`/`--accent-text`; partículas releen `--accent-text` con `MutationObserver` | un solo acento (se retiran violeta y cian); el núcleo usa `--surface-1`/`--bg` (funciona en claro) |
| Portal: táctil | revisar interacción | se mantiene: tocar el escenario abre el portal un instante y el botón es un enlace directo a WhatsApp | un segundo toque obligatorio empeoraba el CTA |
| Contacto: email | `CopyEmail` + toast | botón «Copiar email» (con la dirección visible desde `sm`), `Toast` de éxito/error, sin enlace `mailto:` en la sección | el `mailto:` sigue en el pie; se quitaron `emailUrl`, `emailSubject` y `emailBody` |
| Contacto: acciones | email, GitHub, LinkedIn | email, GitHub y LinkedIn **solo si `site.linkedin` no es `null`** | no hay URL de LinkedIn |
| Bug corregido | — | `cn()` usa `extendTailwindMerge` con `text-small/body/h2…` | twMerge descartaba `text-accent-ink` de los botones (texto gris sobre lima) |

---

## 5. Deuda temporal

- **El diseño legacy ya no existe:** se borraron `styles/legacy.css`, `.legacy-shell`, `content/legacy.ts`, `--lg-*`, `SeccionAnimada`, `SectionTitle` y los `.css`/`.jsx` de Tecnologías y Contacto. Ya no hay archivos `.jsx` ni warnings `INEFFECTIVE_DYNAMIC_IMPORT` en el build.
- **Títulos `<title>`/meta** vía elementos hoisted de React 19; `hreflang`, canonical, OG y JSON-LD → **Fase 11**.
- **Sin `vercel.json`**, sin `robots.txt`/sitemap/OG images → **Fase 11**.
- **`allowJs`** en `tsconfig` ya no hace falta (no quedan `.js/.jsx` en `src`): se puede quitar en la Fase 10.

---

## 6. Pendientes que necesito de Agustín

| Dato | Fase | Estado |
|---|---|---|
| **Aprobar styleguide** (tipografías + acento lima) en `/__styleguide` | 1 | ⏳ pendiente |
| Revisar traducciones al inglés (`locales/en/*.json`, borrador de Claude) | 2, 5, 6 | ⏳ pendiente |
| URLs reales de demo de los proyectos (hoy `demo: null` en los 7; el botón de demo se oculta) | 7 | ⏳ pendiente |
| **Revisar en un navegador real** carrusel (inercia, arrastre, rueda), filtros del índice, lightbox y la transición compartida portada ↔ detalle | 7 | ⏳ pendiente |
| Años y rol de cada proyecto (hoy ocultos: no hay dato) | 7 | ⏳ opcional |
| **Revisar en un navegador real y a la vista** intro, revelado circular de tema, indicador deslizante y View Transitions (el panel de vista previa corre a 1 fps y no las anima) | 3–4 | ⏳ pendiente |
| Texto de disponibilidad ("Disponible para proyectos" / "Open to work") — hoy provisional en el chip del hero y en la tesela | 5–6 | ⏳ confirmar |
| **Revisar en un navegador real** los conectores del mapa de tecnologías (dibujo, hover, pulso), la ficha y el portal de contacto (fluidez a 60 fps en un teléfono, enlace a WhatsApp) | 8–9 | ⏳ pendiente |
| Revisar textos nuevos de contacto y tecnologías (`home.json`: `contact.*`, `tech.label/title`; `common.json`: `tech.level/openDetail`) | 8–9 | ⏳ |
| Revisar textos nuevos de footer/menú (`common.json`: tagline, "Animaciones · Sí/No") | 4 | ⏳ |
| Ubicación (y si va como dato en la tesela) | 6 | ⏳ sin dato: no se muestra |
| Relato "Cocina → Código" (hoy 2 líneas genéricas) | 6 | ⏳ borrador provisional |
| Aprobar copy ES/EN del hero y de las 6 teselas (`home.json`) | 5–6 | ⏳ |
| URL de LinkedIn (¿existe?) y CV (¿se incluye?) — sin LinkedIn el botón no aparece; el CV no se agregó | 9 | ⏳ pendiente |
| Dominio propio (nombre exacto; hoy placeholder `agustintacconi.dev` en `config/site.ts`) | 11–12 | ⏳ |
| ¿Analítica (Vercel Analytics)? | 12 | ⏳ |

---

## 7. Métricas de referencia

| Métrica | Línea base (original) | Hoy (fin Fase 9) | Meta |
|---|---|---|---|
| JS inicial (gzip) | 77.1 KB | **170.6 KB** (fin Fase 9; baja porque se fue todo el código legacy; GSAP 27 KB y features de Motion 29 KB son chunks lazy) | ≤ ~200 KB |
| CSS (gzip) | 9.2 KB | 12.2 KB | — |
| `dist` | 6.2 MB | 4.4 MB | — |
| Imágenes de proyectos | 5.8 MB PNG | 3.2 MB AVIF+WebP | — |
| Lint | 1 error + 2 warnings | 0 | 0 |

Lighthouse todavía no medido (Fase 11).

---

## 8. Riesgos a vigilar en la sesión F

- **Fase 10 (pulido):** sumar al recorte el pulso de conectores de `TechMap` (¿demasiado largo?), la rotación continua de los anillos del portal y el fundido del lightbox/ficha; revisar que nada anime propiedades de layout (`stroke-dashoffset` de los conectores es de SVG, no de layout).
- **Portal en móvil real:** el costo medido es solo de JS; el raster del canvas + capas con `mask-image`/`color-mix` en un teléfono de gama baja no se pudo medir (Fase 11).
- **Transición compartida:** verificada en Chrome headless (una sola `project-cover` en cada captura, ida y vuelta, sin errores) pero no observada a la vista; si la portada se ve "saltar", revisar `object-fit` de `::view-transition-old/new(project-cover)` en `effects.css`.
- **Diálogos y Lenis:** `ui/Dialog` ya trae `data-lenis-prevent` + `useScrollLock`; cualquier diálogo nuevo debe usarlo.
- **Panel de vista previa (640×406 px, ~1 fps):** además de no animar, recorta las capturas con tamaños emulados grandes. Para verificar usé Chrome headless por CDP (script en el scratchpad de la sesión, fuera del repo) con capturas reales a 375/768/1280/1920.
- **Pestañas en segundo plano / panel de vista previa a 1 fps:** las animaciones por frame no se pueden ver ahí; para validar movimiento usar un navegador real a la vista. Para chequear estados finales se puede acelerar GSAP con `gsap.globalTimeline.timeScale(50)` desde consola.
- **LCP del hero:** el H1 queda oculto hasta que GSAP + SplitText cargan; medir en Fase 11 y, si pesa, precargar el chunk o mostrar el H1 antes de partirlo.
- **Hash en el remount por idioma:** al cambiar de idioma el home se remonta y la coreografía del hero se repite (aceptable; revisar si molesta).

## 9. Bitácora

| Fecha | Sesión | Qué se hizo |
|---|---|---|
| 2026-10-26 | A | Fases 0–2 completas. Plan maestro generado; limpieza, TS+Tailwind+tokens+temas+styleguide, rutas ES/EN, i18n, contenido separado, imágenes optimizadas, docs. |
| 2026-10-26 | B | Fases 3–4 completas. Infraestructura de animación (Motion lazy, GSAP dinámico, Lenis), primitivas, laboratorio en styleguide; shell completo (navbar píldora, menú `<dialog>`, footer, skip-link, intro, transiciones de ruta/idioma/tema con View Transitions, fondo con grano). Corregido bug de `cn()` con twMerge. |
| 2026-10-26 | C | Fases 5–6 completas. Hero a sangre completa con canvas refactorizado (CSS vars, tema, ResizeObserver, pausa, estático en reducido) y coreografía GSAP que espera a la intro; `SectionHeading`, `BentoTile` y Sobre mí en bento de 6 teselas; copy ES/EN en `home.json`. Medido: 0.44 ms/frame de JS en el canvas (móvil emulado). |
| 2026-10-26 | D | Fase 7 completa. Carrusel 3D con spring (arrastre + inercia proyectada, teclado, rueda horizontal, snap, puntos/flechas, contador, ARIA, `inert`, lazy), `ProjectCard`, sección del home, índice filtrable con query string, detalle con galería + lightbox sobre `<dialog>` (teclado + swipe), navegación anterior/siguiente, transición compartida portada↔detalle. Eliminados `ProyectoModal`/`ProyectoCard`/`Proyectos.jsx`. Probado agregar/quitar un proyecto (5 pasos). `ScrollManager` ya no salta al tope al cambiar la query. |
| 2026-10-26 | E | Fases 8–9 completas. `ui/Dialog` (primitivo `<dialog>`), `TechMap` con conectores SVG que se dibujan al entrar, ficha `TechDialog` con enlaces a proyectos; portal de contacto reescrito en TS sobre tokens con un solo rAF, `CopyEmail` + `Toast`, sección Contact. Eliminado todo el diseño legacy (isla oscura, `legacy.ts`/`legacy.css`, `SeccionAnimada`, `SectionTitle`). Íconos de marca descartados (ver §4). Corregido un overflow horizontal de 32 px del fondo del portal. |
