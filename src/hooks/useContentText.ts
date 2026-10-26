import { useTranslation } from 'react-i18next'
import type { Locale } from '../i18n/paths'

export interface ProjectText {
  title: string
  short: string
  long: string
  objective: string
  features: string[]
  learnings: string[]
  demoLabel: string
}

export interface TechText {
  usedFor: string[]
  features: string[]
}

/**
 * Textos de contenido indexados por slug (proyectos / tecnologías). Las claves dependen de los
 * datos, así que se leen del recurso cargado en lugar de pasar por las claves tipadas de `t()`.
 */
export function useContentText() {
  const { i18n } = useTranslation()
  const locale = i18n.language as Locale

  function read<T>(ns: 'projects' | 'tech', path: string): T | null {
    return (i18n.getResource(locale, ns, path) as T | undefined) ?? null
  }

  return {
    locale,
    project: (slug: string) => read<ProjectText>('projects', `items.${slug}`),
    tech: (slug: string) => read<TechText>('tech', `items.${slug}`),
  }
}
