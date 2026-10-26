import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-sans font-medium whitespace-nowrap select-none ' +
  'transition-[background-color,border-color,color,transform] duration-(--duration-base) ease-out-expo ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:brightness-110',
  secondary:
    'border border-line-strong bg-surface-1 text-strong hover:border-accent-text hover:text-accent-text',
  ghost: 'text-text hover:text-strong',
}

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-small',
  lg: 'h-13 px-7 text-body',
}

interface Common {
  variant?: Variant
  size?: Size
}

export type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement>
export type ButtonLinkProps = Common & AnchorHTMLAttributes<HTMLAnchorElement>

function buttonClasses({ variant = 'primary', size = 'md' }: Common, className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size }, className)} {...props} />
}

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <a className={buttonClasses({ variant, size }, className)} {...props} />
}
