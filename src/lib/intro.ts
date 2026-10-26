/**
 * Puente entre la intro de la primera visita y las coreografías de entrada (hero…).
 * - `introRevealing` se resuelve cuando la cortina empieza a retirarse (o cuando se decidió no
 *   mostrar la intro): las coreografías arrancan ahí para que el contenido ya esté entrando
 *   mientras se descubre, en vez de esperar a que termine y retrasar el LCP.
 * - `introDone` se resuelve cuando la intro terminó del todo.
 */
let resolveRevealing: () => void = () => {}
let resolveDone: () => void = () => {}

export const introRevealing = new Promise<void>((done) => {
  resolveRevealing = done
})

export const introDone = new Promise<void>((done) => {
  resolveDone = done
})

export function markIntroRevealing() {
  resolveRevealing()
}

export function markIntroDone() {
  resolveRevealing()
  resolveDone()
}
