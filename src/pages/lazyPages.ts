import { lazy } from 'react'

// Las páginas de proyectos van en chunks aparte (no hacen falta para el primer pintado del home).
// `prefetchPages` los descarga cuando el navegador está libre, así el primer clic ya los encuentra.
const loadProjectsIndex = () => import('./ProjectsIndexPage')
const loadProjectDetail = () => import('./ProjectDetailPage')

export const ProjectsIndexPage = lazy(loadProjectsIndex)
export const ProjectDetailPage = lazy(loadProjectDetail)

export function prefetchPages() {
  return Promise.all([loadProjectsIndex(), loadProjectDetail()])
}
