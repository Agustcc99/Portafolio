/*
 * COMPAT TEMPORAL — expone el contenido nuevo (`content/*` + `locales/es`) con la forma de los
 * antiguos `data/proyectos.js` y `data/tecnologias.js`, para que las secciones del diseño anterior
 * sigan funcionando hasta reescribirse (Fases 8–9). Se elimina junto con `styles/legacy.css`.
 */
import esProjects from '../i18n/locales/es/projects.json'
import esTech from '../i18n/locales/es/tech.json'
import { projects as projectList } from './projects'
import { levelMarkers, techCategories, techLabels, techMeta, type TechCategoryId, type TechLevel } from './technologies'

const projectText = esProjects.items as Record<string, (typeof esProjects.items)['consultorio-odontologico']>
const techText = esTech.items as Record<string, { usedFor: string[]; features: string[] }>

/** Solo `id` y `titulo`: `TechnologyModal` los usa para nombrar los proyectos de cada tecnología. */
export const proyectos = projectList.map((p) => ({
  id: p.order,
  titulo: projectText[p.slug]?.title ?? p.slug,
}))

const legacyCategoryId: Record<TechCategoryId, string> = {
  interface: 'interfaz',
  logic: 'logica',
  data: 'datos',
  delivery: 'entrega',
}
const legacyCategoryColor: Record<TechCategoryId, string> = {
  interface: 'verde',
  logic: 'celeste',
  data: 'violeta',
  delivery: 'magenta',
}
const legacyLevel: Record<TechLevel, string> = {
  main: 'principal',
  projects: 'proyectos',
  learning: 'aprendizaje',
}

export const CATEGORIAS_TECNICAS = techCategories.map((c) => ({
  id: legacyCategoryId[c.id],
  numero: c.number,
  nombre: esTech.categories[c.id].name,
  color: legacyCategoryColor[c.id],
  descripcion: esTech.categories[c.id].description,
  tecnologias: [...c.techs],
}))

export const NIVELES_TECNICOS: Record<string, { etiqueta: string; marcador: string }> = Object.fromEntries(
  (Object.keys(levelMarkers) as TechLevel[]).map((level) => [
    legacyLevel[level],
    { etiqueta: esTech.levels[level].label, marcador: levelMarkers[level] },
  ]),
)

const idBySlug = new Map(projectList.map((p) => [p.slug, p.order]))

export const TECNOLOGIAS_INFO: Record<
  string,
  { nombre: string; nivel: string; usadoPara: string[]; funcionalidades: string[]; proyectos: Array<number | string> }
> = Object.fromEntries(
  Object.entries(techMeta).map(([slug, meta]) => [
    slug,
    {
      nombre: techLabels[slug] ?? slug,
      nivel: legacyLevel[meta.level],
      usadoPara: techText[slug]?.usedFor ?? [],
      funcionalidades: techText[slug]?.features ?? [],
      proyectos: meta.projects.map((ref) => idBySlug.get(ref) ?? ref),
    },
  ]),
)
