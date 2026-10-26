import { useEffect, useState } from 'react'

/**
 * Sección del home que cruza una franja fina a ~40 % de la altura de la ventana
 * (`IntersectionObserver`, sin escuchar `scroll`). Al llegar al pie de página queda activa la última.
 * El pie se marca con `data-page-end`.
 */
export function useActiveSection<T extends string>(ids: readonly T[], enabled: boolean) {
  const [active, setActive] = useState<T | null>(null)

  useEffect(() => {
    if (!enabled) return

    const crossing = new Set<T>()
    let atEnd = false

    const resolve = () => {
      const last = ids[ids.length - 1]
      if (atEnd && last) return setActive(last)
      const current = [...ids].reverse().find((id) => crossing.has(id))
      if (current) setActive(current)
    }

    const sections = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as T
          if (entry.isIntersecting) crossing.add(id)
          else crossing.delete(id)
        }
        resolve()
      },
      { rootMargin: '-40% 0px -59% 0px' },
    )
    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) sections.observe(element)
    }

    const end = document.querySelector('[data-page-end]')
    const endObserver = new IntersectionObserver(([entry]) => {
      atEnd = entry?.isIntersecting ?? false
      resolve()
    })
    if (end) endObserver.observe(end)

    return () => {
      sections.disconnect()
      endObserver.disconnect()
    }
  }, [ids, enabled])

  return enabled ? active : null
}
