import type { ProjectData } from './types'

export type { ProjectCategory, ProjectData } from './types'

// Cada archivo `<slug>.ts` de esta carpeta exporta un proyecto por defecto y se registra solo:
// para sumar uno no hay que tocar este archivo (ver docs/AGREGAR_PROYECTO.md).
const modules = import.meta.glob<{ default: ProjectData }>(['./*.ts', '!./index.ts', '!./types.ts'], {
  eager: true,
})

export const projects: readonly ProjectData[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.order - b.order)

/** Máximo de proyectos en el carrusel del home. */
export const MAX_FEATURED = 7

export const featuredProjects = projects.filter((p) => p.featured).slice(0, MAX_FEATURED)

export function getProject(slug: string | undefined) {
  return projects.find((p) => p.slug === slug)
}

/** Proyectos vecinos para la navegación "Anterior / Siguiente" (circular). */
export function getNeighbours(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug)
  if (i < 0) return null
  const prev = projects[(i - 1 + projects.length) % projects.length]
  const next = projects[(i + 1) % projects.length]
  return prev && next ? { prev, next } : null
}
