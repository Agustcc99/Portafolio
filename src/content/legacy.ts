/*
 * COMPAT TEMPORAL — expone el contenido nuevo (`content/*` + `locales/es`) con la forma de los
 * antiguos `data/proyectos.js` y `data/tecnologias.js`, para que las secciones del diseño anterior
 * sigan funcionando hasta reescribirse (Fases 7–9). Se elimina junto con `styles/legacy.css`.
 */
import esProjects from '../i18n/locales/es/projects.json'
import esTech from '../i18n/locales/es/tech.json'
import { getProjectImage } from './images'
import { projects as projectList } from './projects'
import { levelMarkers, techCategories, techLabels, techMeta, type TechCategoryId, type TechLevel } from './technologies'

const projectText = esProjects.items as Record<string, (typeof esProjects.items)['consultorio-odontologico']>
const techText = esTech.items as Record<string, { usedFor: string[]; features: string[] }>

const legacyProjectColor: Record<string, string> = {
  'consultorio-odontologico': 'verde',
  'presupuestos-vidrieria': 'celeste',
  'api-ecommerce': 'violeta',
  'turnos-psiquiatria': 'rosa',
  'landing-vidrieria': 'celeste',
  'control-habitos': 'violeta',
  'landing-semillas': 'verde',
}

export const proyectos = projectList.map((p) => {
  const text = projectText[p.slug]
  return {
    id: p.order,
    titulo: text?.title ?? p.slug,
    categoria: esProjects.categories[p.category],
    destacado: p.featured,
    color: legacyProjectColor[p.slug] ?? 'verde',
    descripcionCorta: text?.short ?? '',
    descripcionLarga: text?.long ?? '',
    objetivo: text?.objective ?? '',
    tecnologias: p.techs.map((t) => techLabels[t] ?? t),
    funcionalidades: text?.features ?? [],
    aprendizajes: text?.learnings ?? [],
    textoDemo: text?.demoLabel ?? '',
    demo: p.links.demo,
    codigo: p.links.code ?? '#',
    imagen: '',
    imagenes: p.images.flatMap((key) => {
      const image = getProjectImage(key)
      return image ? [image.src(960)] : []
    }),
  }
})

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
