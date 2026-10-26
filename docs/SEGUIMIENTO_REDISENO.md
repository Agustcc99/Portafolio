# Seguimiento del rediseño del portafolio

> Documento vivo. **Al abrir una conversación nueva:** leé este archivo y luego `plan_actualizacion_portafolio.md` (§8 en adelante para la fase que toca). **Al cerrar una sesión:** actualizá §1, §3, §4 y §6.
> Última actualización: 2026-10-26 (cierre de la sesión C).

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
| 7 | Proyectos | ⬜ | — |
| 8 | Tecnologías | ⬜ | — |
| 9 | Contacto | ⬜ | — |
| 10 | Pulido de movimiento | ⬜ | — |
| 11 | Rendimiento, SEO y accesibilidad | ⬜ | — |
| 12 | Despliegue en Vercel + dominio | ⬜ | — |

**Sesiones:** A (0–2) ✅ · B (3–4) ✅ · C (5–6) ✅ · **D (7) ← siguiente** · E (8–9) · F (10–12).

**Rama:** `rediseno` (5 commits sobre `main`, sin pushear). `main` sigue en `2dfd0df`.
**No commitear nunca:** `.claude/launch.json` y `.claude/run-amor-v2.cmd` (son de otro proyecto).

---

## 2. Cómo retomar (sesión D)

Prompt de arranque (del plan §11):

> Lee `plan_actualizacion_portafolio.md` y `docs/SEGUIMIENTO_REDISENO.md` completos. Estamos en la **Fase 7**. Ejecutá solo las tareas de esas fases, en orden, siguiendo las convenciones de §8 y el sistema de diseño de §3. Al terminar, corré la verificación estándar, mostrame capturas (375/1280, ambos temas e idiomas), tildá las tareas completadas en el plan, hacé el commit de fase y detenete para mi aprobación antes de seguir.

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
    legacy.ts                         ⚠ COMPAT TEMPORAL (ver §5)
  providers/ThemeProvider.tsx         tema oscuro/claro, persiste en localStorage('theme')
  hooks/useTheme.ts, useContentText.ts
  components/ui/                      Container, Button(+buttonClasses), Chip, ProjectImage
  components/layout/                  ThemeToggle, LangSwitch, LocaleLayout (barra flotante PROVISIONAL)
  pages/                              HomePage (diseño viejo), ProjectsIndexPage / ProjectDetailPage (datos crudos), NotFoundPage, Styleguide (dev)
  styles/index.css                    @theme con tokens; styles/legacy.css ⚠ temporal
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
src/pages/HomePage.tsx   <main> con Hero + About nuevos y Proyectos/Tecnologías/Contacto aún en legacy-shell
```
Providers en `main.tsx`: Theme → MotionPrefs → SmoothScroll → BrowserRouter. Shell en `LocaleLayout`.

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
| Bug corregido | — | `cn()` usa `extendTailwindMerge` con `text-small/body/h2…` | twMerge descartaba `text-accent-ink` de los botones (texto gris sobre lima) |

---

## 5. Deuda temporal (se paga en fases concretas)

- **`styles/legacy.css`, wrapper `.legacy-shell`, `content/legacy.ts`, variables `--lg-*` y los `.css` por componente viejo** → se borran sección a sección; todo desaparece al cerrar la **Fase 9**. Mientras tanto el home se ve igual que el original (dentro de una "isla" oscura).
- **`.legacy-shell__inner`** ahora solo envuelve Proyectos, Tecnologías y Contacto (`padding-block: 2rem`); Hero y Sobre mí ya son del sistema nuevo.
- **Archivos `.jsx` pendientes de pasar a TS:** `InteractiveHeroGrid` (F5), `Proyectos`/`ProyectoCard`/`ProyectoModal` (F7), `Tecnologias`/`TechnologyModal` (F8), `ContactPortal`/`PortalParticles` (F9), `SeccionAnimada` y `SectionTitle` (los usan las secciones viejas que quedan; se borran en F7–F9).
- **Páginas `/proyectos` y detalle** con datos crudos → diseño real en **Fase 7**.
- **Warnings de build** `INEFFECTIVE_DYNAMIC_IMPORT` (es/projects.json y es/tech.json) → los causa `legacy.ts`; se van con él.
- **Títulos `<title>`/meta** vía elementos hoisted de React 19; `hreflang`, canonical, OG y JSON-LD → **Fase 11**.
- **Sin `vercel.json`**, sin `robots.txt`/sitemap/OG images → **Fase 11**.

---

## 6. Pendientes que necesito de Agustín

| Dato | Fase | Estado |
|---|---|---|
| **Aprobar styleguide** (tipografías + acento lima) en `/__styleguide` | 1 | ⏳ pendiente |
| Revisar traducciones al inglés (`locales/en/*.json`, borrador de Claude) | 2, 5, 6 | ⏳ pendiente |
| URLs reales de demo de los proyectos (hoy `demo: null` en los 7) | 7 | ⏳ pendiente |
| **Revisar en un navegador real y a la vista** intro, revelado circular de tema, indicador deslizante y View Transitions (el panel de vista previa corre a 1 fps y no las anima) | 3–4 | ⏳ pendiente |
| Texto de disponibilidad ("Disponible para proyectos" / "Open to work") — hoy provisional en el chip del hero y en la tesela | 5–6 | ⏳ confirmar |
| Revisar textos nuevos de footer/menú (`common.json`: tagline, "Animaciones · Sí/No") | 4 | ⏳ |
| Ubicación (y si va como dato en la tesela) | 6 | ⏳ sin dato: no se muestra |
| Relato "Cocina → Código" (hoy 2 líneas genéricas) | 6 | ⏳ borrador provisional |
| Aprobar copy ES/EN del hero y de las 6 teselas (`home.json`) | 5–6 | ⏳ |
| URL de LinkedIn (¿existe?) y CV (¿se incluye?) | 9 | ⏳ |
| Dominio propio (nombre exacto; hoy placeholder `agustintacconi.dev` en `config/site.ts`) | 11–12 | ⏳ |
| ¿Analítica (Vercel Analytics)? | 12 | ⏳ |

---

## 7. Métricas de referencia

| Métrica | Línea base (original) | Hoy (fin Fase 2) | Meta |
|---|---|---|---|
| JS inicial (gzip) | 77.1 KB | **171.4 KB** (+Motion core, Lenis, shell, hero y bento; GSAP 27 KB y features de Motion 29 KB son chunks lazy) | ≤ ~200 KB |
| CSS (gzip) | 9.2 KB | 16.3 KB | — |
| `dist` | 6.2 MB | 4.1 MB | — |
| Imágenes de proyectos | 5.8 MB PNG | 3.2 MB AVIF+WebP | — |
| Lint | 1 error + 2 warnings | 0 | 0 |

Lighthouse todavía no medido (Fase 11).

---

## 8. Riesgos a vigilar en la sesión D

- **Carrusel 3D:** conserva `perspective` y arrastre; mover las constantes de tuning (`ANCHO_SLOT_POR_DEFECTO`, `PASO_RATIO`…) tipadas; sin autoplay; solo slots cercanos con coste completo.
- **Transición compartida** portada → detalle: `view-transition-name` por proyecto + `transitionRoute` (ya existe) con el nombre en la imagen de la tarjeta y la del hero; cuidar que no choque con `data-vt='route'` (anima `root`).
- **Pestañas en segundo plano / panel de vista previa a 1 fps:** las animaciones por frame no se pueden ver ahí; para validar movimiento usar un navegador real a la vista. Para chequear estados finales se puede acelerar GSAP con `gsap.globalTimeline.timeScale(50)` desde consola.
- **LCP del hero:** el H1 queda oculto hasta que GSAP + SplitText cargan; medir en Fase 11 y, si pesa, precargar el chunk o mostrar el H1 antes de partirlo.
- **Hash en el remount por idioma:** al cambiar de idioma el home se remonta y la coreografía del hero se repite (aceptable; revisar si molesta).
- **Isla `legacy-shell`**: sigue oscura en tema claro hasta la Fase 9.

## 9. Bitácora

| Fecha | Sesión | Qué se hizo |
|---|---|---|
| 2026-10-26 | A | Fases 0–2 completas. Plan maestro generado; limpieza, TS+Tailwind+tokens+temas+styleguide, rutas ES/EN, i18n, contenido separado, imágenes optimizadas, docs. |
| 2026-10-26 | B | Fases 3–4 completas. Infraestructura de animación (Motion lazy, GSAP dinámico, Lenis), primitivas, laboratorio en styleguide; shell completo (navbar píldora, menú `<dialog>`, footer, skip-link, intro, transiciones de ruta/idioma/tema con View Transitions, fondo con grano). Corregido bug de `cn()` con twMerge. |
| 2026-10-26 | C | Fases 5–6 completas. Hero a sangre completa con canvas refactorizado (CSS vars, tema, ResizeObserver, pausa, estático en reducido) y coreografía GSAP que espera a la intro; `SectionHeading`, `BentoTile` y Sobre mí en bento de 6 teselas; copy ES/EN en `home.json`. Medido: 0.44 ms/frame de JS en el canvas (móvil emulado). |
