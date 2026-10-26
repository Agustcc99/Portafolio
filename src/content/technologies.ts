// Datos neutros al idioma del mapa de arquitectura. Los textos de cada ficha viven en
// `i18n/locales/*/tech.json` bajo `items.<slug>`.
// Para agregar una tecnología: sumarla a `techLabels`, a una categoría de `techCategories`
// y (si debe abrir ficha) a `techMeta` + `tech.json` de cada idioma con el mismo slug.

export type TechLevel = 'main' | 'projects' | 'learning'
export type TechCategoryId = 'interface' | 'logic' | 'data' | 'delivery'

/** Nombre visible de cada tecnología (nombres de marca: no se traducen). */
export const techLabels: Record<string, string> = {
  html: 'HTML5',
  css: 'CSS3',
  javascript: 'JavaScript',
  react: 'React',
  vite: 'Vite',
  bootstrap: 'Bootstrap',
  nodejs: 'Node.js',
  express: 'Express',
  java: 'Java',
  springboot: 'Spring Boot',
  jwt: 'JWT',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  git: 'Git',
  github: 'GitHub',
  postman: 'Postman',
  jest: 'Jest',
  junit: 'JUnit',
  docker: 'Docker',
  aws: 'AWS',
  // Aparecen en proyectos pero no tienen ficha en el mapa:
  mongoose: 'Mongoose',
  bcrypt: 'bcrypt',
  supertest: 'Supertest',
  dotenv: 'Dotenv',
}

export const techCategories: ReadonlyArray<{
  id: TechCategoryId
  number: string
  techs: readonly string[]
}> = [
  { id: 'interface', number: '01', techs: ['html', 'css', 'javascript', 'react', 'vite', 'bootstrap'] },
  { id: 'logic', number: '02', techs: ['nodejs', 'express', 'java', 'springboot', 'jwt'] },
  { id: 'data', number: '03', techs: ['mysql', 'mongodb'] },
  { id: 'delivery', number: '04', techs: ['git', 'github', 'postman', 'jest', 'junit', 'docker', 'aws'] },
]

export const levelMarkers: Record<TechLevel, string> = {
  main: '●',
  projects: '◆',
  learning: '○',
}

const ALL_APPS = [
  'consultorio-odontologico',
  'presupuestos-vidrieria',
  'api-ecommerce',
  'turnos-psiquiatria',
  'landing-vidrieria',
  'control-habitos',
] as const

const FRONT_APPS = [
  'consultorio-odontologico',
  'presupuestos-vidrieria',
  'turnos-psiquiatria',
  'landing-vidrieria',
  'control-habitos',
] as const

/** `projects` referencia slugs de proyecto, o `'portfolio'` para este mismo sitio. */
export const techMeta: Record<string, { level: TechLevel; projects: readonly string[] }> = {
  html: { level: 'main', projects: ['landing-semillas'] },
  css: { level: 'main', projects: ['landing-semillas'] },
  javascript: { level: 'main', projects: FRONT_APPS },
  react: { level: 'main', projects: FRONT_APPS },
  vite: { level: 'main', projects: ['portfolio'] },
  bootstrap: {
    level: 'main',
    projects: ['consultorio-odontologico', 'turnos-psiquiatria', 'landing-vidrieria', 'control-habitos'],
  },
  nodejs: { level: 'main', projects: ALL_APPS },
  express: { level: 'main', projects: ALL_APPS },
  java: { level: 'projects', projects: [] },
  springboot: { level: 'projects', projects: [] },
  jwt: {
    level: 'projects',
    projects: ['presupuestos-vidrieria', 'api-ecommerce', 'turnos-psiquiatria', 'control-habitos'],
  },
  mysql: { level: 'learning', projects: [] },
  mongodb: { level: 'main', projects: ALL_APPS },
  git: { level: 'main', projects: [...ALL_APPS, 'landing-semillas'] },
  github: { level: 'main', projects: [...ALL_APPS, 'landing-semillas'] },
  postman: { level: 'main', projects: ALL_APPS },
  jest: { level: 'projects', projects: ['api-ecommerce'] },
  junit: { level: 'learning', projects: [] },
  docker: { level: 'learning', projects: [] },
  aws: { level: 'learning', projects: [] },
}
