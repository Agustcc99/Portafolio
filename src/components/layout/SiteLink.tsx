import type { MouseEvent } from 'react'
import { Link, useLocation, useNavigate, useResolvedPath, type LinkProps } from 'react-router'
import { canViewTransition, transitionRoute } from '../../lib/viewTransition'

/**
 * `Link` que anima el cambio de página con la View Transitions API cuando el destino es otra
 * ruta. Los saltos a un ancla de la misma página no animan: los resuelve `ScrollManager`.
 */
export function SiteLink({ to, onClick, target, ...props }: LinkProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const destination = useResolvedPath(to)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    const plain =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
    if (!plain || (target && target !== '_self')) return
    if (destination.pathname === pathname || !canViewTransition()) return
    event.preventDefault()
    transitionRoute(() => navigate(to))
  }

  return <Link to={to} target={target} onClick={handleClick} {...props} />
}
