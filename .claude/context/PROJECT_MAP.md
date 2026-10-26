# PROJECT_MAP — Portafolio Agustín Tacconi
SPA React 19 + TS 6 + Vite 8 + Tailwind 4, ES/EN, sin backend. Prod: https://agusdev.com.ar (Vercel). Rama de trabajo `rediseno`. Node >=22.22.
Docs: `plan_actualizacion_portafolio.md` (roadmap §8), `docs/SEGUIMIENTO_REDISENO.md` (estado/decisiones/bitácora), `docs/AGREGAR_PROYECTO.md`, `docs/DESPLIEGUE.md`.
NO commitear: `.claude/launch.json`, `.claude/run-amor-v2.cmd` (otro proyecto).

## COMANDOS
dev(:5173) | build = `vite build && scripts/prerender-meta.mjs` (falla si hash CSP != script inline de index.html) | lint | typecheck | i18n:check | images | og(Chrome) | icons | preview

## ARBOL
```
index.html                 script anti-flash de tema (hash en vercel.json CSP)
vercel.json                redirects / (cookie lang > Accept-Language es* > /en, 307), rewrite SPA, headers+CSP, caché
vite.config.ts eslint.config.js tsconfig.json
assets-src/proyectos/<carpeta>/*.png   fuente imágenes (minúsculas)
public/ proyectos/<carpeta>/*.{avif,webp}  og/<lang>.jpg og/<lang>/<slug>.jpg  favicon.* icon-*.png site.webmanifest
scripts/ optimize-images.mjs generate-og.mjs generate-icons.mjs check-i18n.mjs prerender-meta.mjs lib/content.mjs
src/ main.tsx App.tsx routes.tsx
  config/site.ts  content/{technologies.ts,images.ts,projects/*}  i18n/  lib/  hooks/  providers/
  components/{ui,layout,hero,projects,tech,contact,seo}  sections/{Hero,About,Projects,Technologies,Contact}
  pages/  styles/{index.css,effects.css}
```

## CONFIG / CONTENIDO
- `config/site.ts`: `site{name,brand,url='https://agusdev.com.ar',email,whatsapp,github,linkedin:null}`; `SITE_URL` env lo pisa en build
- `content/projects/<slug>.ts`: default `ProjectData{slug,order,featured,category,techs[],links{demo,code},images[]}`; 7 proyectos (api-ecommerce sin imágenes)
- `content/projects/index.ts`: `projects`, `MAX_FEATURED=7`, `featuredProjects`, `getProject(slug)->P|undef`, `getNeighbours(slug)->{prev,next}`; autoregistro `import.meta.glob`
- `content/projects/images.generated.json` (generado por `npm run images`)
- `content/technologies.ts`: `techLabels`, `techCategories`, `levelMarkers`, `techMeta{level,projects}`; `TechLevel`, `TechCategoryId`
- `content/images.ts`: `getProjectImage(key)->ProjectImageInfo|null`

## i18n / RUTAS
- `i18n/paths.ts`: `locales`,`Locale`,`defaultLocale`,`segments`(projects/proyectos),`paths`,`isLocale(v)`,`detectLocale()->Locale`,`saveLocale(l)`(cookie lang+localStorage),`switchLocalePath(pathname,to,search,hash)`
- `i18n/index.ts`: `namespaces[common,home,projects,tech,seo]`,`initI18n(l)`,`preloadLocale(l)`,`activateLanguage(l)`,`setLanguage(l)`; lee textos de `#i18n-bootstrap` (prerender)
- `i18n/locales/{es,en}/*.json`: claves idénticas (check-i18n)
- `routes.tsx`: `AppRoutes()` /es /en (+proyectos|projects/:slug), 404 también fuera de idioma

## LIB
- `cn(...ClassValue)->string` (twMerge con escala tipográfica propia)
- `motion.ts`: `duration{fast,base,slow,hero}`,`ease`,`spring`,`stagger{base .07}`,`reveal`,`revealVariants(y)`,`groupVariants(gap,delay)`,`fadeVariants`
- `gsap.ts`: `loadGsap()`,`loadGsapKit({scroll})->GsapKit`,`attachLenis(lenis|null)`,`useGsapContext(...)`
- `intro.ts`: `introRevealing`,`introDone` (promesas),`markIntroRevealing()`,`markIntroDone()`
- `deferred.ts`: `forceMountAll()`,`hasPendingSections(el?)`,`ensureSectionsMounted(el?,timeoutMs)`,`markLoaded/wasLoaded(id)`,`subscribeForced`
- `viewTransition.ts`: `canViewTransition()`,`transitionRoute(update)`,`transitionTheme(apply,origin?)`,`routeCommitted()`
- `sharedCover.ts`: `nameCover(el,slug)`,`coverTransitionName(slug)`,`COVER_TRANSITION_NAME`
- `seo.ts`: fuente única de metadatos; `pageSeo(...)->SeoPage`,`buildHeadTags(page,siteUrl,jsonLd)->HeadTag[]`,`pageJsonLd(...)`,`absoluteUrl(siteUrl,path)`,`ogImagePath(locale,slug?)`
- `motionFeatures.ts`: features `domMax` (chunk aparte)

## HOOKS / PROVIDERS
- hooks: `useActiveSection(ids,enabled)`,`useContentText()->{project,tech}`,`useMediaQuery(q)`,`useMotionPrefs()`,`useReducedMotion()`,`useSmoothScroll()`,`useScrollLock(locked)`,`useTheme()`,`useToast()`
- providers (orden en main.tsx): Theme(localStorage 'theme') -> MotionPrefs(LazyMotion+MotionConfig+data-motion) -> SmoothScroll(Lenis dinámico, autoRaf, scrollTo/lock) -> Toast -> BrowserRouter; contextos en `*-context.ts`

## COMPONENTES
- ui: `Button/ButtonLink`,`buttonClasses`,`Chip`,`chipClasses`,`Container`,`Dialog({open,onClose,label})`(<dialog>+scroll lock),`MagneticButton`,`ProjectImage`(picture srcset),`Reveal/RevealGroup`,`ScrollProgress`,`SectionHeading`,`SplitHeading`(GSAP SplitText),`BentoTile`
- layout: `LocaleLayout`(shell),`Navbar`,`MobileMenu`,`Footer`,`SkipLink`,`IntroSequence`,`PageTransition`,`ScrollManager`,`SiteBackground`,`SiteLink`,`LangSwitch`,`ThemeToggle`,`MotionToggle`,`Monogram`,`DeferredSection`(secciones bajo pliegue),`navItems`(sectionIds home/about/projects/tech/contact)
- hero: `InteractiveHeroGrid` canvas (CSS vars, ResizeObserver, pausa offscreen)
- projects: `ProjectCarousel3D`(spring Motion),`ProjectCard`,`ProjectGrid`,`ProjectFilters`(?cat=&tech=),`Gallery`,`Lightbox`,`ProjectNav`,`CoverPlaceholder`
- tech: `TechMap`,`TechNode`,`TechConnector`(SVG pathLength),`TechDialog`
- contact: `ContactPortal`(un rAF),`particleField.ts`(`createParticleField(canvas,count)`,`hexToRgb`),`CopyEmail`
- seo: `Seo({kind,project})` (tags hoisted React 19)
- sections: Hero, About(bento 6), Projects, Technologies, Contact
- pages: HomePage, ProjectsIndexPage, ProjectDetailPage (lazy vía `lazyPages.ts` + `prefetchPages()`), NotFoundPage, Styleguide+MotionLab (solo dev `/__styleguide`)

## SCRIPTS
- `prerender-meta.mjs`: dist/<ruta>/index.html x18, sitemap.xml, robots.txt, JSON-LD, i18n-bootstrap, preloads, guardia hash CSP
- `generate-og.mjs`: OG JPG por idioma/proyecto (Chrome headless) | `optimize-images.mjs`: sharp AVIF/WebP | `generate-icons.mjs` | `check-i18n.mjs` | `lib/content.mjs`: `loadSite/loadProjects/loadLocale/loadImageIndex/importTs`

## DEPS CLAVE
- `lib/seo.ts` <- `components/seo/Seo.tsx` + `scripts/prerender-meta.mjs` (importa `.ts` por type stripping; solo `i18n/paths.ts` como dependencia)
- `config/site.ts` <- seo, ContactPortal/Contact, Footer, scripts/lib/content.mjs
- `content/projects/index.ts` <- sections/Projects, pages Index/Detail, TechDialog, prerender
- `SmoothScrollProvider` <- `ui/Dialog` (lock), `ScrollManager`, `DeferredSection`/`lib/deferred.ts`
- `lib/intro.ts` <- IntroSequence, Hero (coreografía espera `introRevealing`)
- `lib/gsap.ts` <- SplitHeading, Hero, SmoothScrollProvider (attachLenis)
- `lib/viewTransition.ts` <- LangSwitch, ThemeToggle, PageTransition, ProjectCard/Detail (sharedCover)
- `vercel.json` CSP hash == sha256 del script inline de `index.html`

## PENDIENTE
- Código: sin TODO/FIXME en src/scripts
- Fase 12 (ver SEGUIMIENTO): push + alta Vercel + DNS (Cloudflare, DNS only) de Agustín; pruebas prod, previews OG, Lighthouse prod, analítica (decisión), merge `rediseno`->`main` con confirmación
- De Agustín: LinkedIn, URLs demo (`links.demo:null` x7), revisión copy/EN, «feel» hero/intro, aprobación visual
- Opcional: Perf mobile >=90 en índice/detalle exige SSG del primer pantallazo (decisión de Agustín)

## ULTIMO COMMIT MAPEADO: c17acf7106865c4bce37d6658169180e6b4293b0
