import { canViewTransition } from './viewTransition'

/**
 * Transición compartida portada → detalle (y de vuelta). Los `view-transition-name` deben ser
 * únicos en cada captura, así que solo lleva nombre UNA portada por página: la del proyecto que
 * se está abriendo (en la página que se deja) y la de ese mismo proyecto (en la que llega).
 *  - Página que se deja: `nameCover` pone el nombre directo en el DOM justo antes de navegar.
 *  - Página que llega: `coverTransitionName` lo devuelve para el render, durante una ventana corta.
 */
export const COVER_TRANSITION_NAME = 'project-cover'

const WINDOW_MS = 2000

let pendingSlug: string | null = null
let timer: ReturnType<typeof setTimeout> | undefined

/** `slug` es el proyecto cuya portada llevará el nombre en la página de destino. */
export function nameCover(element: HTMLElement | null, slug: string) {
  if (!element || !canViewTransition()) return
  element.style.viewTransitionName = COVER_TRANSITION_NAME
  pendingSlug = slug
  clearTimeout(timer)
  timer = setTimeout(() => {
    pendingSlug = null
  }, WINDOW_MS)
}

/** Nombre de la transición para la portada de `slug`, si es la que se está animando. */
export function coverTransitionName(slug: string) {
  return pendingSlug === slug ? COVER_TRANSITION_NAME : undefined
}
