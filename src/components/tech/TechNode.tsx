import { useTranslation } from 'react-i18next'
import { techCategories, techLabels, type TechCategoryId } from '../../content/technologies'
import { cn } from '../../lib/cn'
import { BentoTile } from '../ui/BentoTile'
import { chipClasses } from '../ui/chipClasses'
import { Reveal } from '../ui/Reveal'

interface TechNodeProps {
  category: (typeof techCategories)[number]
  delay: number
  onHover: (id: TechCategoryId | null) => void
  onOpen: (slug: string) => void
}

/** Categoría del mapa: número mono, nombre, descripción y chips que abren la ficha de cada tecnología. */
export function TechNode({ category, delay, onHover, onOpen }: TechNodeProps) {
  const { t } = useTranslation('tech')
  const { t: tc } = useTranslation()

  return (
    <Reveal as="article" className={cn('min-w-0', `tech-map__node--${category.id}`)} delay={delay}>
      <div
        className="h-full"
        onPointerEnter={() => onHover(category.id)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(category.id)}
        onBlur={() => onHover(null)}
      >
        <BentoTile className="flex flex-col gap-4">
          <span className="font-mono text-label tracking-[0.12em] text-accent-text">{category.number}</span>
          <h3 className="text-h3">{t(`categories.${category.id}.name`)}</h3>
          <p className="text-small text-pretty">{t(`categories.${category.id}.description`)}</p>
          <ul className="mt-auto flex flex-wrap gap-2 pt-2">
            {category.techs.map((slug) => (
              <li key={slug}>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={tc('tech.openDetail', { name: techLabels[slug] ?? slug })}
                  onClick={() => onOpen(slug)}
                  className={chipClasses(
                    false,
                    'min-h-8 cursor-pointer transition-colors duration-(--duration-base) hover:border-accent-text hover:text-accent-text',
                  )}
                >
                  {techLabels[slug] ?? slug}
                </button>
              </li>
            ))}
          </ul>
        </BentoTile>
      </div>
    </Reveal>
  )
}
