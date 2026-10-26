# Seguimiento del rediseño del portafolio

> Documento vivo. **Al abrir una conversación nueva:** leé este archivo y luego `plan_actualizacion_portafolio.md` (§8 en adelante para la fase que toca). **Al cerrar una sesión:** actualizá §1, §3, §4 y §6.
> Última actualización: 2026-10-26 (cierre de la Fase 11, sesión F).

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
| 10 | Pulido de movimiento | ✅ Completa · ⏳ falta revisión del «feel» de Agustín | `fase 10` |
| 11 | Rendimiento, SEO y accesibilidad | ✅ Completa · ⚠️ mobile Performance 86–88 en índice/detalle (meta 90) · ⏳ falta dominio real para probar previews | `fase 11` |
| 12 | Despliegue en Vercel + dominio | ⬜ | — |

**Sesiones:** A (0–2) ✅ · B (3–4) ✅ · C (5–6) ✅ · D (7) ✅ · E (8–9) ✅ · **F (10–12): Fases 10 y 11 hechas, ← siguiente: Fase 12 (despliegue)**.

**Rama:** `rediseno` (9 commits sobre `main`, sin pushear). `main` sigue en `2dfd0df`.
**No commitear nunca:** `.claude/launch.json` y `.claude/run-amor-v2.cmd` (son de otro proyecto).

---

## 2. Cómo retomar (sesión F)

Prompt de arranque (del plan §11):

> Lee `plan_actualizacion_portafolio.md` y `docs/SEGUIMIENTO_REDISENO.md` completos. Estamos en la **Fase 12**. Ejecutá solo las tareas de esa fase, en orden, siguiendo las convenciones de §8 y el sistema de diseño de §3. Al terminar, corré la verificación estándar, mostrame capturas (375/1280, ambos temas e idiomas), tildá las tareas completadas en el plan, hacé el commit de fase y detenete para mi aprobación antes de seguir.

Comandos:

```bash
git checkout rediseno
npm run lint && npm run typecheck && npm run build   # verificación estándar
npm run i18n:check                                    # paridad de claves ES/EN
npm run images                                        # regenera imágenes optimizadas
npm run og                                            # imágenes Open Graph (necesita Chrome/Edge)
npm run icons                                         # favicon.ico, apple-touch-icon, íconos del manifest
npm run build                                         # vite build + scripts/prerender-meta.mjs
npm run preview                                       # sirve dist (sin vercel.json: no aplica redirects ni cabeceras)
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
Fase 10 (nuevo):
```
src/styles/index.css   --duration-hero y la utilidad `pressable` (única receta de micro-interacción: color + escala 0.97 al pulsar)
src/pages/NotFoundPage.tsx   404 dentro del shell; routes.tsx la monta también en rutas fuera de /es y /en (DetectedLayout)
```
Fase 11 (nuevo):
```
src/lib/seo.ts                  fuente única de metadatos por página (título, descripción, canonical, hreflang, OG/Twitter, JSON-LD); la importan <Seo> y el script de build (Node con type stripping: solo importa i18n/paths.ts con extensión .ts)
src/components/seo/Seo.tsx      renderiza las etiquetas como elementos hoisted de React 19
src/lib/deferred.ts + components/layout/DeferredSection.tsx   secciones del home bajo el pliegue (projects, tech, contact) con montaje diferido
src/pages/lazyPages.ts          ProjectsIndexPage / ProjectDetailPage con React.lazy + prefetch en reposo
scripts/prerender-meta.mjs      post-build: dist/<ruta>/index.html x18, sitemap.xml, robots.txt, guardia de la CSP
scripts/generate-og.mjs         OG 1200x630 por idioma y proyecto (Chrome headless) -> public/og/
scripts/generate-icons.mjs      íconos desde public/favicon.svg
scripts/lib/content.mjs         lectura de site/proyectos/textos desde Node
vercel.json                     redirects, rewrite SPA, cabeceras, caché
public/                         favicon.svg/.ico, apple-touch-icon.png, icon-192/512.png, site.webmanifest, og/
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
| Fase 10: duraciones y easings | valores sueltos | todo sale de tokens: portal (480 ms / 0.5 s / 0.3 s → `--duration-slow/base`), conectores (800 ms → `--duration-hero`), view transitions (salida `--duration-fast`, entrada `--duration-slow` con 100 ms de espera; shared element y revelado de tema 600 ms) | un solo ritmo en todo el sitio |
| Fase 10: micro-interacciones | hover/foco/press en todo | utilidad `pressable` en píldoras, círculos y chips (navbar, menú, selectores, filtros, chips de tecnología, lightbox, ficha, copiar email, enlaces de contacto); texto corrido y tarjetas grandes solo cambian color/borde | el feedback de pulsación en texto corrido o tarjetas enormes se sentía raro |
| Fase 10: stagger | 0.06–0.08 según sección | siempre `stagger.base` (0.07) | consistencia |
| Fase 10: navbar compacto | `padding` animado al hacer scroll | solo borde, fondo y sombra | el `padding` es propiedad de layout (la regla §1.2 prohíbe animarlas); el cambio de 4 px de alto sin animar se ve como un salto |
| Fase 10: reveals anidados | `Reveal` envolviendo piezas que ya coreografían su entrada | quitados en Tecnologías (`TechNode` ya revela) y Contacto (el portal ya coreografía la suya) | evitaba un doble fundido |
| Fase 10: animaciones recortadas | `ping` infinito en el punto de la tesela de disponibilidad; anillos del portal girando siempre | el punto queda fijo (ya late en el chip del hero); los anillos giran solo con el portal en pantalla (`data-inview`) | dos pulsos iguales en la página no aportaban; no animar fuera de pantalla |
| Fase 10: movimiento reducido manual | — | también anula esperas (`transition-delay`/`animation-delay`) | los conectores tenían retraso propio y aparecían tarde |
| Color en transiciones | solo transform/opacity | además `color`, `background-color`, `border-color`, `box-shadow` en estados hover/foco (solo pintura, sin layout) | es el estándar de hover; lo que no se anima nunca son width/height/margin/padding/top/left |
| Fase 11: metadatos | título/description en cada página | `lib/seo.ts` (fuente única) → `<Seo>` en el cliente y `prerender-meta.mjs` en el build; los tags prerenderizados llevan `data-prerender` y `main.tsx` los retira antes de montar para no duplicar | el HTML por ruta sirve a WhatsApp/LinkedIn (no ejecutan JS) y a Google; el cliente mantiene título/canonical al navegar |
| Fase 11: JSON-LD | `Person` + `WebSite` | `Person`+`WebSite` en el inicio; `BreadcrumbList` en índice y detalle | migas de pan para Google |
| Fase 11: imágenes OG | `og/es.png`, `og/en.png` | **JPG** (`/og/<idioma>.jpg` y `/og/<idioma>/<slug>.jpg`, ~40–65 KB) generadas con Chrome headless (`npm run og`) | WhatsApp pide < 300 KB; fuentes y diseño reales del sitio |
| Fase 11: robots.txt | `public/robots.txt` | generado en el build (lleva la URL absoluta del sitemap) | un solo lugar para el dominio |
| Fase 11: favicon | `favicon.svg` de Vite | monograma «A» lima (`favicon.svg` trazado a mano, sin fuentes) + `.ico`, apple-touch (sin transparencia), 192/512 y `site.webmanifest` (`npm run icons`) | el favicon era el logo de la plantilla de Vite |
| Fase 11: redirect de `/` | `Accept-Language` | cookie `lang` (la escribe `saveLocale`) → `Accept-Language` (`es*`) → `/en`; todos 307 | el servidor no ve `localStorage`: sin la cookie, la elección manual se perdía al entrar por `/` |
| Fase 11: CSP | «razonable» | `default-src 'self'`; `script-src 'self'` + hash del script anti-flash; `style-src 'unsafe-inline'` (Motion/GSAP escriben `style`); `img-src 'self' data:`; sin frames. `prerender-meta.mjs` **falla el build** si el hash de `index.html` cambia y `vercel.json` no se actualizó (los saltos de línea del HTML se normalizan a LF para que el hash no dependa del checkout) | verificado sin violaciones en consola con un servidor que emula `vercel.json` |
| Fase 11: caché `/proyectos/*` | inmutable | inmutable (1 año) como pide el plan, **pero los archivos no tienen hash**: reemplazar una captura exige un nombre nuevo (anotado en `AGREGAR_PROYECTO.md`) |  |
| Fase 11: secciones diferidas | — | `DeferredSection` (Proyectos, Tecnologías, Contacto): el `<section id>` existe siempre con alto reservado (`100svh`); el contenido (chunk aparte) se prefetchea en reposo y se monta al acercarse a una pantalla, al saltar a un ancla (`SmoothScrollProvider.scrollTo` espera a las secciones que condicionan el destino) o 4–5 s después de cargar (Ctrl+F, rastreadores). Un deep link `/es#contact` oculta la página (`html[data-anchoring]`) hasta que todo montó y el scroll está en su sitio (sin eso el CLS era 0.35–0.85) | quita carrusel, mapa y portal del primer pintado (TBT 320 → 40 ms) |
| Fase 11: intro y hero | la coreografía espera a que termine la intro | arranca cuando la cortina empieza a subir (`introRevealing`); el párrafo del hero (candidato a LCP) se ve desde el primer pintado y solo se desliza (`translate` en vez de `opacity`); timeline más compacta (párrafo 0.2 s, CTAs 0.45, datos 0.55, indicador 0.9) | el plan decía que la intro no bloquea el LCP, pero el hero estaba oculto hasta el final de la intro (LCP 3.9 → 2.9 s). **Cambia el «feel»: conviene tu revisión** |
| Fase 11: GSAP | kit completo | `loadGsapKit({ scroll })`: ScrollTrigger solo donde hay animaciones por scroll; los `h1` de índice y detalle usan `trigger="mount"` | −18 KB gzip en esas páginas |
| Fase 11: Lenis | estático | `import('lenis')` dinámico | −5 KB gzip del bundle inicial; en táctil nunca se baja |
| Fase 11: páginas de proyectos | — | `React.lazy` (índice y detalle, con galería y lightbox dentro del chunk) + `<Suspense fallback min-h-svh>` en `LocaleLayout` (sin él el CLS era 1.0) + prefetch en reposo; el prerender las precarga (`modulepreload`) y precarga la portada AVIF LCP |  |
| Fase 11: textos incrustados | chunks JSON por idioma | el prerender incrusta los textos del idioma en el HTML (`<script type="application/json" id="i18n-bootstrap">`, ~7 KB gzip) y `i18n/index.ts` los lee de ahí; los chunks quedan para el cambio de idioma y para dev | una cascada de 5 peticiones menos |
| Fase 11: `modulepreload` de chunks de idioma y GSAP | — | **descartado**: medido, empeoraba el FCP (2.3 → 3.4 s) | compite por ancho de banda con el bundle |
| Fase 11: fuentes | `preload` de las críticas | `preload` de Bricolage, Geist e Instrument Serif itálica (latín cubre tildes y ñ); sin preload el FCP subía 0.3–0.5 s |  |
| Fase 11: accesibilidad | — | `SplitHeading` pone `aria-label` en el heading (no en un `<span>`) y oculta las palabras partidas; nombres accesibles que contienen el texto visible (WCAG 2.5.3): marca sin `aria-label`, `ES — Español`, «Scroll: ir a la sección…», botón de WhatsApp; `LangSwitch` pasa de `<nav>` a `role="group"` (landmarks duplicados); títulos de tarjeta `h2` bajo el `h1` del índice (`headingLevel`) | axe sin violaciones |
| Fase 11: bug corregido | — | **Lenis no tenía `autoRaf: true`**: sin bucle propio la rueda del mouse no desplazaba la página y los anclas animados no se movían (solo funcionaban los saltos `immediate`) | descubierto al probar los anclas con las secciones diferidas |
| Fase 11: `engines` / build | — | `engines.node >= 22.22` y `buildCommand: npm run build` en `vercel.json` | el prerender usa type stripping de Node y la preset de Vite podría correr solo `vite build` |
| `allowJs` | temporal | **eliminado de `tsconfig`** | no quedan `.js/.jsx` en `src` |
| Bug corregido | — | `cn()` usa `extendTailwindMerge` con `text-small/body/h2…` | twMerge descartaba `text-accent-ink` de los botones (texto gris sobre lima) |

---

## 5. Deuda temporal

- **El diseño legacy ya no existe:** se borraron `styles/legacy.css`, `.legacy-shell`, `content/legacy.ts`, `--lg-*`, `SeccionAnimada`, `SectionTitle` y los `.css`/`.jsx` de Tecnologías y Contacto. Ya no hay archivos `.jsx` ni warnings `INEFFECTIVE_DYNAMIC_IMPORT` en el build.
- **Dominio placeholder** `agustintacconi.dev` en `config/site.ts` (lo usan canonical, sitemap, OG y JSON-LD; `SITE_URL=... npm run build` lo sobrescribe sin tocar el código). Al fijar el dominio real: cambiarlo, correr `npm run build` y revisar `vercel.json` (CSP) si se suma analítica.
- **Lighthouse mobile** de índice y detalle 86–88 (meta 90): ver §7. Sin SSR no baja de ahí.

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
| **Revisar el «feel» a la vista** (Fase 10): ritmo de reveals y transiciones de página, pulsación de botones, giro de los anillos del portal, 404 | 10 | ⏳ pendiente |
| **Revisar en un navegador real** los conectores del mapa de tecnologías (dibujo, hover, pulso), la ficha y el portal de contacto (fluidez a 60 fps en un teléfono, enlace a WhatsApp) | 8–9 | ⏳ pendiente |
| Revisar textos nuevos de contacto y tecnologías (`home.json`: `contact.*`, `tech.label/title`; `common.json`: `tech.level/openDetail`) | 8–9 | ⏳ |
| Revisar textos nuevos de footer/menú (`common.json`: tagline, "Animaciones · Sí/No") | 4 | ⏳ |
| Ubicación (y si va como dato en la tesela) | 6 | ⏳ sin dato: no se muestra |
| Relato "Cocina → Código" (hoy 2 líneas genéricas) | 6 | ⏳ borrador provisional |
| Aprobar copy ES/EN del hero y de las 6 teselas (`home.json`) | 5–6 | ⏳ |
| URL de LinkedIn (¿existe?) y CV (¿se incluye?) — sin LinkedIn el botón no aparece; el CV no se agregó | 9 | ⏳ pendiente |
| Dominio propio (nombre exacto; hoy placeholder `agustintacconi.dev` en `config/site.ts`) | 12 (lo usan canonical, sitemap, OG y JSON-LD) | ⏳ |
| ¿Analítica (Vercel Analytics)? | 12 | ⏳ |
| **Revisar el «feel» del hero/intro** tras el cambio de la Fase 11 (la coreografía arranca cuando la cortina sube; el párrafo ya se ve desde el primer pintado) | 11 | ⏳ pendiente |
| Revisar las imágenes OG (`public/og/**`) y los textos nuevos de `seo.json` (`person.*`, `og.*`) y de accesibilidad (`home.json` → `hero.scrollTo`, `common.json`) | 11 | ⏳ |
| ¿Querés llegar a Performance mobile >= 90 en índice/detalle? Exige SSG/prerender del contenido (ver §8) | 11 | ⏳ decisión tuya |

---

## 7. Métricas de referencia

| Métrica | Línea base (original) | Hoy (fin Fase 10) | Meta |
|---|---|---|---|
| JS inicial (gzip) | 77.1 KB | **151 KB** (fin Fase 11: `index` 139 KB + `react` 16 KB; GSAP, features de Motion, Lenis, páginas de proyectos y las secciones bajo el pliegue son chunks aparte) | ≤ ~200 KB |
| CSS (gzip) | 9.2 KB | 9.7 KB (más ~5 KB en los chunks de Proyectos, Tecnologías y Contacto) | — |
| `dist` | 6.2 MB | 5.8 MB (incluye 14 OG, 18 HTML por ruta y los textos incrustados) | — |
| Imágenes de proyectos | 5.8 MB PNG | 3.2 MB AVIF+WebP | — |
| OG / íconos | — | 14 JPG (~40–65 KB c/u) + íconos | WhatsApp < 300 KB |
| Lint | 1 error + 2 warnings | 0 | 0 |

**Lighthouse (Fase 11)**: build de producción servido por un emulador de `vercel.json` (redirects, rewrite, cabeceras, brotli) en `localhost`, Chrome headless, throttling simulado por defecto (móvil = 4x CPU + 4G lenta). Lighthouse, axe y puppeteer-core se instalaron en el scratchpad de la sesión, fuera del proyecto.

| Página (ES) | Mobile Perf | FCP / LCP / TBT / CLS (mobile) | Desktop Perf | A11y | BP | SEO |
|---|---|---|---|---|---|---|
| Home `/es` | **94** (EN 93) | 2.0 s / 2.8 s / 50 ms / 0 | 99 | 100 | 100 | 100 |
| Índice `/es/proyectos` | **87** (EN 86) | 2.2 s / 3.7 s / 10 ms / 0 | 99 | 100 | 100 | 100 |
| Detalle `/es/proyectos/consultorio-odontologico` | **88** (EN 86) | 2.2 s / 3.6 s / 30 ms / 0 | 99 | 100 | 100 | 100 |
| 404 `/es/nada` | 91 | no aplica | 100 | 100 | 100 | 63 (a propósito: `noindex`) |

Línea de partida (sin optimizar): mobile home 76, índice 82, detalle 86; LCP 3.9–4.1 s; TBT 320 ms. Sin throttling el LCP observado es 0.2–0.9 s (FCP 0.15–0.25 s). Las cifras EN son de la corrida previa a quitar ScrollTrigger de índice/detalle (+1–2 puntos).

**Metas de §7:** cumplidas en desktop (>= 95), Accessibility (100), Best Practices (100), SEO (100), CLS (0), TBT (< 100 ms) y JS inicial (151 KB). **No cumplidas:** Performance mobile >= 90 en índice/detalle (86–88) y LCP < 2.0 s (2.8–3.9 s simulado). Causa: la app es CSR; el primer pintado depende de ~150 KB de JS + CSS + fuentes a 1.6 Mbps (~420 KB antes del LCP en el detalle). Se probaron y descartaron las precargas de chunks; lo que queda es renderizar contenido a HTML (ver §8, «Pendiente»).

**Accesibilidad:** axe-core sin violaciones en `/es`, `/en`, índice, detalle (ES y EN) y 404, en tema claro y oscuro, a 375 y 1280 px (con movimiento reducido para medir el contraste en estado final); también con el menú móvil, una ficha de tecnología y el lightbox abiertos. Teclado: orden de tabulación coherente, anillo de foco en todo, skip-link, focus trap y Escape en los tres diálogos con retorno de foco, flechas en carrusel y lightbox. Estructura revisada (un `h1`, jerarquía sin saltos, landmarks, `lang`). Revisión con lector de pantalla real (NVDA/VoiceOver) **no hecha**: solo árbol de accesibilidad.

**Matriz visual:** 7 rutas x 2 temas x 4 anchos (375/768/1280/1920), ES y EN: sin scroll horizontal y consola limpia (56 combinaciones).

**Movimiento (Fase 10, Chrome headless en modo dev, scroll completo del home a 1280 px):** CLS 0, sin tareas largas, 189 cuadros con mediana 16.7 ms y p95 16.8 ms. Un recorrido tarjeta → detalle → índice → filtro solo registró un desplazamiento al filtrar con un clic sintético (los clics reales con `hadRecentInput` no cuentan).

---

## 8. Riesgos a vigilar en la sesión F

- **Feel:** ritmo y tiempos se ajustaron por tokens pero no se pudieron ver a la vista; si algo se siente lento o brusco, el lugar para tocar es `lib/motion.ts` / `--duration-*` en `index.css` (cambia todo el sitio a la vez).
- **Fase 11:** medir el costo de raster del portal y de los `mask-image`/`backdrop-blur` en un teléfono de gama baja (Lighthouse mobile).
- **Portal en móvil real:** el costo medido es solo de JS; el raster del canvas + capas con `mask-image`/`color-mix` en un teléfono de gama baja no se pudo medir (Fase 11).
- **Transición compartida:** verificada en Chrome headless (una sola `project-cover` en cada captura, ida y vuelta, sin errores) pero no observada a la vista; si la portada se ve "saltar", revisar `object-fit` de `::view-transition-old/new(project-cover)` en `effects.css`.
- **Diálogos y Lenis:** `ui/Dialog` ya trae `data-lenis-prevent` + `useScrollLock`; cualquier diálogo nuevo debe usarlo.
- **Panel de vista previa (640×406 px, ~1 fps):** además de no animar, recorta las capturas con tamaños emulados grandes. Para verificar usé Chrome headless por CDP (script en el scratchpad de la sesión, fuera del repo) con capturas reales a 375/768/1280/1920.
- **Pestañas en segundo plano / panel de vista previa a 1 fps:** las animaciones por frame no se pueden ver ahí; para validar movimiento usar un navegador real a la vista. Para chequear estados finales se puede acelerar GSAP con `gsap.globalTimeline.timeScale(50)` desde consola.
- **LCP del hero (resuelto en Fase 11):** el párrafo se ve desde el primer pintado y la coreografía arranca con la cortina de la intro; el H1 sigue oculto hasta que GSAP + SplitText cargan (ya no es el candidato a LCP). Precargar los chunks de GSAP empeoraba el FCP (ver §4).
- **Pendiente (opcional):** para Performance mobile >= 90 en índice/detalle el camino es renderizar a HTML el contenido del primer pantallazo (SSG parcial o completo con hidratación). Hoy el tema, el idioma, el movimiento reducido y la intro se leen del navegador al renderizar, así que habría que guardarlos para evitar desajustes de hidratación.
- **Portal / `mask-image` / `backdrop-blur` en un teléfono real:** Lighthouse mobile simulado no mostró problemas (TBT 50 ms, CLS 0), pero no se probó en hardware.
- **Previews de enlaces:** el HTML por ruta trae OG/Twitter correctos en ES y EN (verificado leyendo el HTML servido); probarlos de verdad (WhatsApp, LinkedIn, Facebook Debugger) requiere el dominio publicado → Fase 12. Si se cambia copy o diseño, regenerar con `npm run og`.
- **Hash en el remount por idioma:** al cambiar de idioma el home se remonta y la coreografía del hero se repite (aceptable; revisar si molesta).

## 9. Bitácora

| Fecha | Sesión | Qué se hizo |
|---|---|---|
| 2026-10-26 | A | Fases 0–2 completas. Plan maestro generado; limpieza, TS+Tailwind+tokens+temas+styleguide, rutas ES/EN, i18n, contenido separado, imágenes optimizadas, docs. |
| 2026-10-26 | B | Fases 3–4 completas. Infraestructura de animación (Motion lazy, GSAP dinámico, Lenis), primitivas, laboratorio en styleguide; shell completo (navbar píldora, menú `<dialog>`, footer, skip-link, intro, transiciones de ruta/idioma/tema con View Transitions, fondo con grano). Corregido bug de `cn()` con twMerge. |
| 2026-10-26 | C | Fases 5–6 completas. Hero a sangre completa con canvas refactorizado (CSS vars, tema, ResizeObserver, pausa, estático en reducido) y coreografía GSAP que espera a la intro; `SectionHeading`, `BentoTile` y Sobre mí en bento de 6 teselas; copy ES/EN en `home.json`. Medido: 0.44 ms/frame de JS en el canvas (móvil emulado). |
| 2026-10-26 | D | Fase 7 completa. Carrusel 3D con spring (arrastre + inercia proyectada, teclado, rueda horizontal, snap, puntos/flechas, contador, ARIA, `inert`, lazy), `ProjectCard`, sección del home, índice filtrable con query string, detalle con galería + lightbox sobre `<dialog>` (teclado + swipe), navegación anterior/siguiente, transición compartida portada↔detalle. Eliminados `ProyectoModal`/`ProyectoCard`/`Proyectos.jsx`. Probado agregar/quitar un proyecto (5 pasos). `ScrollManager` ya no salta al tope al cambiar la query. |
| 2026-10-26 | E | Fases 8–9 completas. `ui/Dialog` (primitivo `<dialog>`), `TechMap` con conectores SVG que se dibujan al entrar, ficha `TechDialog` con enlaces a proyectos; portal de contacto reescrito en TS sobre tokens con un solo rAF, `CopyEmail` + `Toast`, sección Contact. Eliminado todo el diseño legacy (isla oscura, `legacy.ts`/`legacy.css`, `SeccionAnimada`, `SectionTitle`). Íconos de marca descartados (ver §4). Corregido un overflow horizontal de 32 px del fondo del portal. |
| 2026-10-26 | F | Fase 11 completa. Metadatos por ruta (`lib/seo.ts`, `<Seo>`, `prerender-meta.mjs`: 18 HTML, sitemap, robots, JSON-LD, textos incrustados, precarga de fuentes/página/portada), favicon real + manifest, 14 imágenes OG, `vercel.json` (redirects por cookie/Accept-Language, rewrite SPA, CSP por hash con guardia en el build, caché inmutable). Rendimiento: secciones del home diferidas, páginas de proyectos/Lenis/ScrollTrigger en chunks aparte, hero e intro reordenados para el LCP (mobile home 76 → 94, desktop 99). Accesibilidad: axe limpio, nombres accesibles, headings, landmarks, teclado y diálogos. **Corregido: Lenis sin `autoRaf` (la rueda del mouse no scrolleaba).** Pendiente: mobile 86–88 en índice/detalle y dominio real. |
| 2026-10-26 | F | Fase 10 completa. Auditoría de movimiento: tokens de duración/easing en portal, mapa y view transitions; utilidad `pressable`; stagger único; fuera reveals anidados, `ping` duplicado y transición de `padding` del navbar; anillos del portal pausados fuera de pantalla; 404 rediseñada en el shell (también fuera de /es y /en); `allowJs` eliminado. Medido CLS 0 y 60 fps en el recorrido del home. |
