/**
 * Portada de los proyectos sin capturas (p. ej. una API): trama de puntos y la categoría en serif
 * itálica. Ocupa todo su contenedor, así que puede llevar el mismo `view-transition-name` que una imagen.
 */
export function CoverPlaceholder({ label }: { label: string }) {
  return (
    <div className="relative grid size-full place-items-center overflow-hidden bg-surface-2">
      <span
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: 'radial-gradient(var(--line-strong) 1px, transparent 1.5px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(70% 70% at 50% 50%, #000, transparent)',
        }}
      />
      <span aria-hidden className="relative font-serif text-[clamp(2.5rem,8vw,5rem)] leading-none text-accent-text italic">
        {label}
      </span>
    </div>
  )
}
