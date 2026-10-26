/**
 * Estado compartido de las secciones del home que se montan de forma diferida (`DeferredSection`).
 * Cuando algo necesita que todas existan (saltar a un ancla, restaurar el scroll) se llama a
 * `ensureSectionsMounted()`: monta las que faltan y resuelve cuando terminaron de pintarse.
 */
let forcedAll = false
const listeners = new Set<() => void>()
/** Ids que ya se montaron alguna vez en esta sesión: al volver al home aparecen de una (sin salto de altura). */
const everLoaded = new Set<string>()

export function subscribeForced(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getForcedAll = () => forcedAll
export const wasLoaded = (id: string) => everLoaded.has(id)
export const markLoaded = (id: string) => everLoaded.add(id)

export function forceMountAll() {
  if (forcedAll) return
  forcedAll = true
  listeners.forEach((listener) => listener())
}

/**
 * Hay secciones diferidas sin su contenido. Con `target` solo cuentan las que condicionan su posición:
 * la propia (para que no llegue vacía) y las que están por encima (su alto empuja el destino).
 */
export function hasPendingSections(target?: Element | null) {
  const pending = [...document.querySelectorAll('[data-deferred]:not([data-loaded])')]
  if (!target) return pending.length > 0
  return pending.some(
    (section) => section === target || section.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING,
  )
}

const nextFrame = () =>
  new Promise<void>((resolve) => {
    // rAF no corre en pestañas ocultas: el temporizador evita quedar colgados.
    const fallback = window.setTimeout(resolve, 50)
    requestAnimationFrame(() => {
      window.clearTimeout(fallback)
      resolve()
    })
  })

export async function ensureSectionsMounted(target?: Element | null, timeoutMs = 2000) {
  forceMountAll()
  const start = performance.now()
  while (hasPendingSections(target) && performance.now() - start < timeoutMs) await nextFrame()
}
