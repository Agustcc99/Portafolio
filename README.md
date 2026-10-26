# Portafolio — Agustín Tacconi

Sitio personal bilingüe (ES/EN) con proyectos, tecnologías y contacto. SPA en React con metadatos prerenderizados por ruta.

- **Producción:** https://agusdev.com.ar (Vercel)
- **Plan y seguimiento:** [`plan_actualizacion_portafolio.md`](plan_actualizacion_portafolio.md) · [`docs/SEGUIMIENTO_REDISENO.md`](docs/SEGUIMIENTO_REDISENO.md)

## Stack

| Área | Herramientas |
|---|---|
| Base | React 19, TypeScript 6, Vite 8, `react-router` 8 (rutas `/es/…` y `/en/…`) |
| Estilos | Tailwind CSS 4 (tokens en `@theme`, `src/styles/index.css`), temas claro/oscuro por `data-theme` |
| Animación | Motion (`LazyMotion`), GSAP + SplitText/ScrollTrigger (carga dinámica), Lenis, View Transitions |
| i18n | `i18next` + `react-i18next`, recursos tipados en `src/i18n/locales/{es,en}` |
| Imágenes | `sharp` → AVIF + WebP en 480/960/1600 px (`npm run images`) |
| SEO | `src/lib/seo.ts` + `scripts/prerender-meta.mjs` (HTML por ruta, sitemap, robots, JSON-LD) |
| Hosting | Vercel (preset Vite); redirects, cabeceras y caché en [`vercel.json`](vercel.json) |

Requiere **Node ≥ 22.22** (el prerender usa type stripping de Node).

## Comandos

```bash
npm install
npm run dev          # servidor de desarrollo (puerto 5173); /__styleguide solo en dev
npm run lint && npm run typecheck && npm run build   # verificación estándar
npm run i18n:check   # paridad de claves ES/EN
npm run images       # regenera imágenes optimizadas desde assets-src/
npm run og           # imágenes Open Graph (necesita Chrome o Edge)
npm run icons        # favicon.ico, apple-touch-icon y íconos del manifest
npm run preview      # sirve dist (sin vercel.json: no aplica redirects ni cabeceras)
```

`npm run build` ejecuta `vite build` y luego `scripts/prerender-meta.mjs`, que genera un HTML por ruta (18), `sitemap.xml` y `robots.txt`. El build **falla** si el hash de la CSP en `vercel.json` no coincide con el script inline de `index.html`.

## Agregar un proyecto

5 pasos, sin tocar componentes: capturas en `assets-src/`, `npm run images`, archivo de datos en `src/content/projects/`, textos en ambos idiomas y `npm run og`. Detalle en [`docs/AGREGAR_PROYECTO.md`](docs/AGREGAR_PROYECTO.md).

Las imágenes de `/proyectos/*` se sirven con caché inmutable y sin hash en el nombre: si reemplazás una captura, dale un nombre nuevo.

## Despliegue

Guía completa (Vercel, dominio, DNS, pruebas de producción) en [`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md). Resumen:

- Vercel detecta el framework Vite; el build usa `npm run build` y publica `dist/`.
- El dominio canónico sale de `src/config/site.ts` (`site.url`). Para probar en otra URL sin tocar el código: `SITE_URL=https://mi-preview.vercel.app npm run build`. En Vercel se puede definir `SITE_URL` como variable de entorno solo para *Preview*.
- Si se suma analítica o cualquier recurso externo hay que ampliar la CSP de `vercel.json`; si cambia el script inline de `index.html`, actualizar también su hash.
