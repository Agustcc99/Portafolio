import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { techLabels } from '../../content/technologies'
import { cn } from '../../lib/cn'
import { chipClasses } from '../ui/chipClasses'

/** Tecnologías visibles sin expandir: las más usadas; el resto queda tras "Ver N más". */
const VISIBLE_TECHS = 8

export interface FilterOption {
  id: string
  count: number
}

interface ProjectFiltersProps {
  categories: FilterOption[]
  techs: FilterOption[]
  category: string | null
  tech: string | null
  onCategory: (id: string | null) => void
  onTech: (id: string | null) => void
  onClear: () => void
}

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={chipClasses(
        pressed,
        'pressable min-h-8 cursor-pointer hover:border-line-strong aria-pressed:hover:border-accent-text',
      )}
    >
      {children}
    </button>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-6">
      <p aria-hidden className="w-28 shrink-0 font-mono text-label uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

const textButton = cn(
  'min-h-8 cursor-pointer rounded-pill px-3 font-mono text-label uppercase tracking-[0.12em] text-accent-text',
  'underline-offset-4 hover:underline',
)

/** Filtros por categoría y tecnología (chips con `aria-pressed`). El estado vive en la URL, en la página. */
export function ProjectFilters({
  categories,
  techs,
  category,
  tech,
  onCategory,
  onTech,
  onClear,
}: ProjectFiltersProps) {
  const { t } = useTranslation()
  const { t: tp } = useTranslation('projects')

  const hiddenTechs = techs.slice(VISIBLE_TECHS)
  const activeIsHidden = hiddenTechs.some((option) => option.id === tech)
  const [expanded, setExpanded] = useState(false)
  const showAll = expanded || activeIsHidden
  const visibleTechs = showAll ? techs : techs.slice(0, VISIBLE_TECHS)

  return (
    <div className="flex flex-col gap-5">
      <Group label={t('projects.filterByCategory')}>
        <FilterChip pressed={category === null} onClick={() => onCategory(null)}>
          {t('projects.all')}
        </FilterChip>
        {categories.map(({ id, count }) => (
          <FilterChip key={id} pressed={category === id} onClick={() => onCategory(category === id ? null : id)}>
            {tp(`categories.${id as 'fullstack' | 'backend' | 'frontend'}`)} · {count}
          </FilterChip>
        ))}
      </Group>

      <Group label={t('projects.filterByTech')}>
        <FilterChip pressed={tech === null} onClick={() => onTech(null)}>
          {t('projects.all')}
        </FilterChip>
        {visibleTechs.map(({ id, count }) => (
          <FilterChip key={id} pressed={tech === id} onClick={() => onTech(tech === id ? null : id)}>
            {techLabels[id] ?? id} · {count}
          </FilterChip>
        ))}
        {hiddenTechs.length > 0 && !activeIsHidden && (
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setExpanded((value) => !value)}
            className={textButton}
          >
            {showAll ? t('projects.showLessTech') : t('projects.showMoreTech', { count: hiddenTechs.length })}
          </button>
        )}
      </Group>

      {(category !== null || tech !== null) && (
        <button type="button" onClick={onClear} className={cn(textButton, 'self-start px-0')}>
          {t('projects.clearFilters')}
        </button>
      )}
    </div>
  )
}
