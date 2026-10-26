import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonClasses'

interface Common {
  variant?: ButtonVariant
  size?: ButtonSize
}

export type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement>
export type ButtonLinkProps = Common & AnchorHTMLAttributes<HTMLAnchorElement>

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size }, className)} {...props} />
}

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <a className={buttonClasses({ variant, size }, className)} {...props} />
}
