import { useState } from 'react'
import { MagneticButton } from '../../components/ui/MagneticButton'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { Reveal, RevealGroup } from '../../components/ui/Reveal'
import { SplitHeading } from '../../components/ui/SplitHeading'
import { useMotionPrefs } from '../../hooks/useReducedMotion'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import { MotionToggle } from '../../components/layout/MotionToggle'

/** Estado interno de GSAP: sirve para comprobar que no hay fugas tras montar/desmontar en bucle. */
async function gsapStats() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  return {
    triggers: ScrollTrigger.getAll().length,
    tweens: gsap.globalTimeline.getChildren(true, true, true).length,
  }
}

function Block({ title, children, replay }: { title: string; children: React.ReactNode; replay?: () => void }) {
  return (
    <div className="rounded-lg border border-line bg-surface-1 p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="font-mono text-label font-normal uppercase tracking-[0.12em] text-muted">
          {title}
        </h3>
        {replay && (
          <Button variant="ghost" onClick={replay} className="h-9 px-3">
            Repetir
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}

function Primitives({ run }: { run: number }) {
  return (
    <div className="space-y-6">
      <Block title="Reveal / RevealGroup (se repite con «Repetir» o al volver a entrar)">
        <RevealGroup className="grid gap-3 sm:grid-cols-4">
          {['Uno', 'Dos', 'Tres', 'Cuatro'].map((label) => (
            <Reveal key={label} className="rounded-md border border-line-strong bg-surface-2 p-5">
              <p className="font-display text-h3 text-strong">{label}</p>
              <p className="text-small">Escalonado 70 ms</p>
            </Reveal>
          ))}
        </RevealGroup>
        <Reveal className="mt-3 rounded-md border border-line-strong bg-surface-2 p-5" delay={0.3}>
          <p className="text-small">Reveal suelto con delay de 300 ms (run {run}).</p>
        </Reveal>
      </Block>

      <Block title="SplitHeading (GSAP SplitText, máscara por línea)">
        <SplitHeading as="h2" trigger="mount" className="text-h2">
          Interfaces <em className="font-serif font-normal text-accent-text">que funcionan</em>, de
          punta a punta
        </SplitHeading>
        <SplitHeading as="p" trigger="scroll" className="mt-6 max-w-[56ch] text-body">
          Con trigger de scroll: la animación arranca recién cuando el texto entra a la pantalla y se
          vuelve a partir si cambia el ancho o el idioma.
        </SplitHeading>
      </Block>

      <Block title="MagneticButton (solo puntero fino, radio 80 px, máx. 8 px)">
        <div className="flex flex-wrap items-center gap-6 py-4">
          <MagneticButton>
            <Button size="lg">Ver proyectos</Button>
          </MagneticButton>
          <MagneticButton>
            <Button variant="secondary" size="lg">
              Contacto
            </Button>
          </MagneticButton>
        </div>
      </Block>
    </div>
  )
}

export function MotionLab() {
  const { reduced, isManual } = useMotionPrefs()
  const { scrollTo } = useSmoothScroll()
  const [run, setRun] = useState(0)
  const [mounted, setMounted] = useState(true)
  const [cycles, setCycles] = useState(0)
  const [stats, setStats] = useState<string>('—')

  const refreshStats = async () => {
    const { triggers, tweens } = await gsapStats()
    setStats(`ScrollTriggers vivos: ${triggers} · tweens/timelines en el reloj global: ${tweens}`)
  }

  // Monta y desmonta las primitivas varias veces seguidas y mide si quedó algo colgado.
  const stress = async () => {
    for (let i = 0; i < 20; i++) {
      setMounted(false)
      await new Promise((resolve) => setTimeout(resolve, 40))
      setMounted(true)
      await new Promise((resolve) => setTimeout(resolve, 60))
      setCycles((value) => value + 1)
    }
    await new Promise((resolve) => setTimeout(resolve, 1500))
    await refreshStats()
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Chip active={!reduced}>{reduced ? 'Movimiento reducido' : 'Movimiento completo'}</Chip>
        <Chip>{isManual ? 'Elegido a mano' : 'Según el sistema'}</Chip>
        <MotionToggle />
        <Button variant="secondary" onClick={() => scrollTo(0)}>
          scrollTo(0)
        </Button>
        <Button variant="secondary" onClick={() => scrollTo('#motion-lab-end')}>
          scrollTo(#motion-lab-end)
        </Button>
        <Button variant="secondary" onClick={() => setRun((value) => value + 1)}>
          Repetir todo
        </Button>
      </div>

      {mounted && <Primitives key={run} run={run} />}

      <div className="mt-8 rounded-lg border border-line bg-surface-1 p-6">
        <h3 className="mb-4 font-mono text-label font-normal uppercase tracking-[0.12em] text-muted">
          Prueba de fugas
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={stress}>Montar/desmontar × 20</Button>
          <Button variant="secondary" onClick={refreshStats}>
            Medir ahora
          </Button>
          <span className="font-mono text-label text-muted">ciclos: {cycles}</span>
        </div>
        <p className="mt-4 font-mono text-small text-text" data-testid="gsap-stats">
          {stats}
        </p>
        <p className="mt-2 max-w-[68ch] text-small text-muted">
          Tras 20 ciclos los ScrollTriggers vivos deben coincidir con los de las primitivas
          visibles (1 por cada SplitHeading con trigger de scroll), no crecer.
        </p>
      </div>

      <div id="motion-lab-end" className="mt-12 text-small text-muted">
        Fin del laboratorio. La barra de progreso de arriba sigue el scroll de la página.
      </div>
    </div>
  )
}
