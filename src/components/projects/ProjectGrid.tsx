import { AnimatePresence, m } from 'motion/react'
import type { ProjectData } from '../../content/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { duration, ease, revealVariants, spring } from '../../lib/motion'
import { coverTransitionName } from '../../lib/sharedCover'
import { ProjectCard } from './ProjectCard'

const itemVariants = {
  ...revealVariants(),
  exit: { opacity: 0, scale: 0.96, transition: { duration: duration.fast, ease: ease.inOut } },
}

/**
 * Grilla responsive del índice. Al filtrar, las tarjetas que quedan se reacomodan con `layout`
 * de Motion y las que salen se desvanecen. La tarjeta cuya portada viaja a/desde el detalle nunca
 * arranca oculta: la view transition necesita verla ya en el DOM.
 */
export function ProjectGrid({ projects }: { projects: readonly ProjectData[] }) {
  const reduced = useReducedMotion()

  return (
    <m.ul layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence initial={false} mode="popLayout">
        {projects.map((project) => (
          <m.li
            key={project.slug}
            layout={reduced ? false : 'position'}
            variants={itemVariants}
            initial={reduced || coverTransitionName(project.slug) ? false : 'hidden'}
            whileInView="visible"
            exit="exit"
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ layout: spring.ui }}
          >
            <ProjectCard project={project} sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" />
          </m.li>
        ))}
      </AnimatePresence>
    </m.ul>
  )
}
