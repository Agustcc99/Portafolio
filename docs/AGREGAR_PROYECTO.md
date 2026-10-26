# Cómo agregar un proyecto

Sumar un proyecto son **5 pasos** y no requiere tocar código de componentes ni registrar nada a mano.
Ejemplo: un proyecto con slug `mi-proyecto`.

## 1. Poné las capturas en `assets-src/`

```
assets-src/proyectos/miproyecto/m1.png
assets-src/proyectos/miproyecto/m2.png
```

- Carpeta y archivos **en minúsculas, sin espacios** (Vercel corre en Linux y distingue mayúsculas).
- Formato PNG o JPG, ancho ideal ≥ 1600 px. No se agrandan: si es más chico se usa tal cual.
- `assets-src/` es la fuente; **nunca** copies imágenes a mano a `public/`.
- `vercel.json` sirve `/proyectos/*` con caché inmutable de un año: si reemplazás una captura, dale un **nombre nuevo** (`m1.png` → `m1b.png`) o los visitantes verán la anterior.

## 2. Generá las versiones optimizadas

```bash
npm run images
```

Crea en `public/proyectos/miproyecto/` los `.avif` y `.webp` en 480 / 960 / 1600 px y actualiza
`src/content/projects/images.generated.json` (dimensiones y placeholder blur). Se commitean ambos.

Las imágenes para compartir el enlace (Open Graph, 1200×630 en `public/og/<idioma>/<slug>.jpg`) se generan
**después de los pasos 3 y 4** (necesitan el archivo de datos y los textos) con `npm run og`; requiere Chrome o
Edge instalado y también se commitean.

## 3. Creá el archivo de datos

`src/content/projects/mi-proyecto.ts` (copiá uno existente):

```ts
import type { ProjectData } from './types'

const project: ProjectData = {
  slug: 'mi-proyecto', // = nombre del archivo; es la URL: /es/proyectos/mi-proyecto
  order: 8, // posición en carrusel, índice y "anterior/siguiente"
  featured: false, // true → aparece en el carrusel del home (se muestran los primeros 7 por `order`)
  category: 'fullstack', // 'fullstack' | 'backend' | 'frontend'
  techs: ['react', 'nodejs', 'mongodb'], // slugs de src/content/technologies.ts (techLabels)
  links: { demo: null, code: 'https://github.com/...' }, // null = el botón se oculta (si ambos son null, no aparece el bloque de enlaces)
  images: ['miproyecto/m1', 'miproyecto/m2'], // carpeta/archivo sin extensión; la 1ª es la portada (`[]` = portada tipográfica, sin galería)
}

export default project
```

El proyecto se registra solo (`import.meta.glob` en `content/projects/index.ts`).
Si usás una tecnología que no existe, agregala primero a `techLabels` en `src/content/technologies.ts`.

## 4. Escribí los textos en **ambos** idiomas

Agregá la misma clave en `src/i18n/locales/es/projects.json` y `src/i18n/locales/en/projects.json`,
dentro de `items`:

```json
"mi-proyecto": {
  "title": "…",
  "short": "Una o dos líneas para la tarjeta.",
  "long": "Descripción completa.",
  "objective": "…",
  "features": ["…"],
  "learnings": ["…"],
  "demoLabel": "Ver demo"
}
```

## 5. Verificá

```bash
npm run og && npm run i18n:check && npm run typecheck && npm run build
```

El build (`scripts/prerender-meta.mjs`) genera solo el HTML de la ruta con su título, descripción, `hreflang`,
Open Graph y datos estructurados, y suma el proyecto a `sitemap.xml`.

`i18n:check` falla si falta alguna clave en un idioma. Después abrí `/es/proyectos/mi-proyecto` y
`/en/projects/mi-proyecto`: el proyecto ya está en el índice (con sus filtros de categoría y tecnología), en "anterior / siguiente" y, si es `featured`, en el carrusel del home.

---

**Para quitar un proyecto:** borrá su archivo `.ts`, su entrada en los dos `projects.json` y (si querés)
su carpeta en `assets-src/` y `public/proyectos/` y sus imágenes `public/og/*/<slug>.jpg`, y corré `npm run images` para regenerar el manifiesto.
