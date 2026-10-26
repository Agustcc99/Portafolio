/**
 * Puente entre la intro de la primera visita y las coreografías de entrada (hero…):
 * `introDone` se resuelve cuando la intro terminó o cuando se decidió no mostrarla, y las
 * animaciones lo esperan para no empezar tapadas por el overlay.
 */
let resolve: () => void = () => {}

export const introDone = new Promise<void>((done) => {
  resolve = done
})

export function markIntroDone() {
  resolve()
}
