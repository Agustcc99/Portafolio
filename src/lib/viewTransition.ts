/**
 * View Transitions API con degradación: si el navegador no la soporta, o hay movimiento reducido,
 * la actualización se aplica directamente (el cambio de ruta no anima; el de tema hace cross-fade
 * por la transición de `background-color` del <body>).
 */

const root = () => document.documentElement

export function canViewTransition() {
  return (
    typeof document.startViewTransition === 'function' && root().dataset.motion !== 'reduce'
  )
}

/** `route` | `theme` activa en <html data-vt> las reglas de effects.css de cada transición. */
function mark(kind: 'route' | 'theme', transition: ReturnType<typeof document.startViewTransition>) {
  root().dataset.vt = kind
  transition.finished
    .catch(() => {
      /* transición saltada o cancelada: solo importa limpiar la marca */
    })
    .finally(() => {
      if (root().dataset.vt === kind) delete root().dataset.vt
    })
}

/* ── Cambio de ruta ───────────────────────────────────────────────────
 * `navigate` no actualiza el DOM de forma síncrona (React Router usa transiciones de React),
 * así que la vista nueva se captura recién cuando `ScrollManager` avisa con `routeCommitted()`.
 */
let release: (() => void) | null = null

/** Lo llama `ScrollManager` una vez que la ruta nueva está en el DOM y el scroll ya se acomodó. */
export function routeCommitted() {
  release?.()
  release = null
}

/** Ejecuta `update` (que debe provocar un cambio de ruta) dentro de una view transition. */
export function transitionRoute(update: () => void) {
  if (!canViewTransition()) {
    update()
    return
  }
  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        release = resolve
        update()
        // Red de seguridad: si la ruta no cambia nunca se resuelve y la página quedaría congelada.
        window.setTimeout(routeCommitted, 1200)
      }),
  )
  mark('route', transition)
}

/* ── Cambio de tema ───────────────────────────────────────────────────
 * Revelado circular desde el botón: el snapshot nuevo se recorta con un `clip-path` creciente.
 */
export function transitionTheme(apply: () => void, origin?: { x: number; y: number }) {
  if (!canViewTransition()) {
    apply()
    return
  }
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? 0
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

  root().dataset.vt = 'theme'
  const transition = document.startViewTransition(apply)
  mark('theme', transition)
  transition.ready
    .then(() => {
      root().animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
    .catch(() => {
      /* transición cancelada (p. ej. otra empezó encima): el tema ya está aplicado */
    })
}
