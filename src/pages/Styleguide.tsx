import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, ButtonLink } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Container } from '../components/ui/Container'
import { ThemeToggle } from '../components/layout/ThemeToggle'
import { ScrollProgress } from '../components/ui/ScrollProgress'
import { MotionLab } from './styleguide/MotionLab'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/cn'

/* ── Contraste WCAG ─────────────────────────────────────────────────── */

type RGB = [number, number, number]

/** Resuelve cualquier color CSS (hex, rgb, var) a RGB usando el navegador. */
function resolveColor(value: string): RGB | null {
  const probe = document.createElement('span')
  probe.style.color = value
  document.body.appendChild(probe)
  const computed = getComputedStyle(probe).color
  probe.remove()
  const m = computed.match(/[\d.]+/g)
  if (!m || m.length < 3) return null
  if (m.length >= 4 && Number(m[3]) < 1) return null // translúcido: no aplica
  return [Number(m[0]), Number(m[1]), Number(m[2])]
}

function luminance([r, g, b]: RGB) {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as RGB
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function ratio(a: RGB, b: RGB) {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

function Ratio({ fg, bg, min = 4.5 }: { fg: string; bg: string; min?: number }) {
  const { theme } = useTheme()
  const [value, setValue] = useState<number | null>(null)
  useEffect(() => {
    // espera al próximo frame para que el tema ya esté aplicado en <html>
    const id = requestAnimationFrame(() => {
      const a = resolveColor(fg)
      const b = resolveColor(bg)
      setValue(a && b ? ratio(a, b) : null)
    })
    return () => cancelAnimationFrame(id)
  }, [fg, bg, theme])

  if (value === null) return <span className="font-mono text-label text-muted">—</span>
  const ok = value >= min
  return (
    <span className={cn('font-mono text-label', ok ? 'text-accent-text' : 'text-red-500')}>
      {value.toFixed(2)}:1 {ok ? 'AA ✓' : 'falla'}
    </span>
  )
}

/* ── Datos de la página ─────────────────────────────────────────────── */

const swatches = [
  ['bg', 'Fondo'],
  ['surface-1', 'Superficie 1'],
  ['surface-2', 'Superficie 2'],
  ['line', 'Línea'],
  ['line-strong', 'Línea fuerte'],
  ['text', 'Texto'],
  ['text-strong', 'Texto fuerte'],
  ['muted', 'Apagado'],
  ['accent', 'Acento (relleno)'],
  ['accent-ink', 'Tinta sobre acento'],
  ['accent-text', 'Acento como texto'],
  ['accent-glow', 'Glow'],
] as const

const pairs = [
  { label: 'text / bg', fg: 'var(--text)', bg: 'var(--bg)', min: 4.5 },
  { label: 'text / surface-1', fg: 'var(--text)', bg: 'var(--surface-1)', min: 4.5 },
  { label: 'text / surface-2', fg: 'var(--text)', bg: 'var(--surface-2)', min: 4.5 },
  { label: 'text-strong / bg', fg: 'var(--text-strong)', bg: 'var(--bg)', min: 4.5 },
  { label: 'muted / bg', fg: 'var(--muted)', bg: 'var(--bg)', min: 4.5 },
  { label: 'muted / surface-2', fg: 'var(--muted)', bg: 'var(--surface-2)', min: 4.5 },
  { label: 'accent-text / bg', fg: 'var(--accent-text)', bg: 'var(--bg)', min: 4.5 },
  { label: 'accent-text / surface-1', fg: 'var(--accent-text)', bg: 'var(--surface-1)', min: 4.5 },
  { label: 'accent-ink / accent (botón)', fg: 'var(--accent-ink)', bg: 'var(--accent)', min: 4.5 },
  { label: 'accent-text / bg (foco, UI)', fg: 'var(--accent-text)', bg: 'var(--bg)', min: 3 },
]

const accents = [
  { id: 'lima', name: 'Lima (propuesto)', accent: '#c4f542', ink: '#0c1203', light: '#3f6212' },
  { id: 'violeta', name: 'Violeta', accent: '#8b5cf6', ink: '#ffffff', light: '#6d28d9' },
  { id: 'azul', name: 'Azul eléctrico', accent: '#4d7cff', ink: '#ffffff', light: '#1d4ed8' },
] as const

const fontSets = [
  {
    id: 'plan',
    name: 'Propuesta: Bricolage + Instrument Serif + Geist',
    display: "'Bricolage Grotesque Variable'",
    serif: "'Instrument Serif'",
    sans: "'Geist Variable'",
  },
  {
    id: 'b',
    name: 'Plan B: Space Grotesk + Fraunces + Sora',
    display: "'Space Grotesk'",
    serif: "'Fraunces'",
    sans: "'Sora'",
  },
] as const

const GOOGLE_FONTS =
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Fraunces:ital,wght@1,400&family=Sora:wght@400;500&display=swap'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-14">
      <h2 className="mb-8 font-mono text-label uppercase tracking-[0.12em] text-muted">{title}</h2>
      {children}
    </section>
  )
}

export default function Styleguide() {
  const { theme } = useTheme()
  const [accentId, setAccentId] = useState<(typeof accents)[number]['id']>('lima')
  const [fontId, setFontId] = useState<(typeof fontSets)[number]['id']>('plan')

  // Las fuentes del Plan B solo se piden desde esta página de desarrollo.
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = GOOGLE_FONTS
    document.head.appendChild(link)
    return () => link.remove()
  }, [])

  const accent = accents.find((a) => a.id === accentId) ?? accents[0]
  const fonts = fontSets.find((f) => f.id === fontId) ?? fontSets[0]

  const accentVars = useMemo(
    () =>
      ({
        '--accent': accent.accent,
        '--accent-ink': accent.ink,
        '--accent-text': theme === 'dark' ? accent.accent : accent.light,
        '--accent-glow': `color-mix(in srgb, ${accent.accent} 18%, transparent)`,
      }) as CSSProperties,
    [accent, theme],
  )

  return (
    <div className="min-h-svh bg-bg pb-24">
      <ScrollProgress />
      <Container>
        <header className="flex items-center justify-between py-8">
          <div>
            <p className="font-mono text-label uppercase tracking-[0.12em] text-accent-text">
              Fases 1 y 3 · solo desarrollo
            </p>
            <h1 className="mt-2 text-h2">Styleguide</h1>
          </div>
          <ThemeToggle />
        </header>

        <Section title={`01 — Paleta y contraste (tema actual: ${theme})`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {swatches.map(([token, label]) => (
              <div key={token} className="overflow-hidden rounded-md border border-line-strong">
                <div className="h-16" style={{ background: `var(--${token})` }} />
                <div className="bg-surface-1 p-3">
                  <p className="text-small text-strong">{label}</p>
                  <p className="font-mono text-label text-muted">--{token}</p>
                </div>
              </div>
            ))}
          </div>
          <table className="mt-8 w-full max-w-2xl text-left text-small">
            <thead>
              <tr className="font-mono text-label uppercase tracking-[0.12em] text-muted">
                <th className="pb-2 font-normal">Par</th>
                <th className="pb-2 font-normal">Ratio</th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((p) => (
                <tr key={p.label} className="border-t border-line">
                  <td className="py-2 text-text">{p.label}</td>
                  <td className="py-2">
                    <Ratio fg={p.fg} bg={p.bg} min={p.min} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 max-w-2xl text-small text-muted">
            En tema claro el relleno lima no alcanza 3:1 contra el fondo, por eso foco, barra de
            progreso e indicadores usan <code className="font-mono">--accent-text</code>; el relleno
            solo se usa en botones, siempre con tinta oscura (≥ 12:1).
          </p>
        </Section>

        <Section title="02 — Tipografía">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Comparador de tipografías">
            {fontSets.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={fontId === f.id}
                onClick={() => setFontId(f.id)}
                className="cursor-pointer"
              >
                <Chip active={fontId === f.id}>{f.name}</Chip>
              </button>
            ))}
          </div>
          <div className="mt-8 space-y-6">
            <p
              className="text-display font-bold"
              style={{ fontFamily: `${fonts.display}, system-ui`, color: 'var(--text-strong)' }}
            >
              Interfaces{' '}
              <em
                className="font-normal"
                style={{ fontFamily: `${fonts.serif}, serif`, color: 'var(--accent-text)' }}
              >
                que funcionan
              </em>
            </p>
            <h2 className="text-h2" style={{ fontFamily: `${fonts.display}, system-ui` }}>
              Un perfil técnico con mirada práctica
            </h2>
            <h3 className="text-h3" style={{ fontFamily: `${fonts.display}, system-ui` }}>
              Quién soy — ñandú, árbol, corazón, ¿qué?
            </h3>
            <p className="max-w-[68ch]" style={{ fontFamily: `${fonts.sans}, system-ui` }}>
              Soy Agustín Tacconi, desarrollador web y gastronómico profesional. Me interesa crear
              soluciones útiles para problemas reales, combinando lógica, diseño y una forma de
              trabajo ordenada. Tildes: á é í ó ú ü ñ ¿ ¡.
            </p>
            <p className="text-small">Texto pequeño — 0.875rem para metadatos y notas.</p>
            <p className="font-mono text-label uppercase tracking-[0.12em]">
              01 — Sobre mí · React / Node / MongoDB
            </p>
          </div>
        </Section>

        <Section title="03 — Acento (comparador)">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Comparador de acento">
            {accents.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-pressed={accentId === a.id}
                onClick={() => setAccentId(a.id)}
                className="cursor-pointer"
              >
                <Chip active={accentId === a.id}>{a.name}</Chip>
              </button>
            ))}
          </div>
          <div
            style={accentVars}
            className="mt-8 rounded-lg border border-line bg-surface-1 p-6 sm:p-10"
          >
            <Chip active>
              <span className="mr-2 inline-block size-1.5 rounded-full bg-accent" />
              Disponible para proyectos
            </Chip>
            <p className="mt-6 font-display text-h2 font-bold text-strong">
              Interfaces <em className="font-serif font-normal text-accent-text">que funcionan</em>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg">Ver proyectos</Button>
              <Button variant="secondary" size="lg">
                Contacto
              </Button>
              <a href="#02" className="text-accent-text underline underline-offset-4">
                Enlace con acento
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-small">
              <span>
                tinta / acento: <Ratio fg="var(--accent-ink)" bg="var(--accent)" />
              </span>
              <span>
                acento texto / superficie: <Ratio fg="var(--accent-text)" bg="var(--surface-1)" />
              </span>
            </div>
            <div className="mt-8 h-0.5 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full w-2/5 bg-accent-text" />
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-small text-muted">
            Para cambiar el acento de forma definitiva se editan 4 variables por tema en{' '}
            <code className="font-mono">src/styles/index.css</code>.
          </p>
        </Section>

        <Section title="04 — Botones y chips">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Deshabilitado</Button>
            <ButtonLink href="#04" size="lg">
              Enlace grande
            </ButtonLink>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Chip>React</Chip>
            <Chip>Node.js</Chip>
            <Chip>MongoDB</Chip>
            <Chip active>Full Stack</Chip>
          </div>
        </Section>

        <Section title="05 — Radios">
          <div className="flex flex-wrap gap-4">
            <div className="flex h-20 w-32 items-center justify-center rounded-sm border border-line-strong bg-surface-1 font-mono text-label text-text">
              rounded-sm
            </div>
            <div className="flex h-20 w-32 items-center justify-center rounded-md border border-line-strong bg-surface-1 font-mono text-label text-text">
              rounded-md
            </div>
            <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-line-strong bg-surface-1 font-mono text-label text-text">
              rounded-lg
            </div>
            <div className="flex h-20 w-32 items-center justify-center rounded-pill border border-line-strong bg-surface-1 font-mono text-label text-text">
              rounded-pill
            </div>
          </div>
        </Section>

        <Section title="06 — Animación (Fase 3)">
          <MotionLab />
        </Section>
      </Container>
    </div>
  )
}
