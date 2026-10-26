import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-sans font-medium whitespace-nowrap select-none ' +
  'transition-[background-color,border-color,color,transform] duration-(--duration-base) ease-out-expo ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:brightness-110',
  secondary:
    'border border-line-strong bg-surface-1 text-strong hover:border-accent-text hover:text-accent-text',
  ghost: 'text-text hover:text-strong',
}

const sizes: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-small',
  lg: 'h-13 px-7 text-body',
}

/** Clases de botón reutilizables para `<Link>` / `<a>` además de `<Button>`. */
export function buttonClasses(
  { variant = 'primary', size = 'md' }: { variant?: ButtonVariant; size?: ButtonSize },
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className)
}
