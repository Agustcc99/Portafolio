import { useEffect, useRef, useState, type ReactNode } from 'react'

interface SeccionAnimadaProps {
  children: ReactNode
  className?: string
  id?: string
}

function SeccionAnimada({ children, className = '', id }: SeccionAnimadaProps) {
  const referenciaSeccion = useRef<HTMLElement>(null)
  const [estaVisible, setEstaVisible] = useState(false)

  useEffect(() => {
    const seccion = referenciaSeccion.current
    const observadorDeSeccion = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) {
          setEstaVisible(true)
          observadorDeSeccion.unobserve(entrada.target)
        }
      },
      { threshold: 0.15 },
    )

    if (seccion) observadorDeSeccion.observe(seccion)

    return () => observadorDeSeccion.disconnect()
  }, [])

  return (
    <section
      id={id}
      ref={referenciaSeccion}
      className={`${className} seccion-animada ${estaVisible ? 'seccion-animada--visible' : ''}`}
    >
      {children}
    </section>
  )
}

export default SeccionAnimada
