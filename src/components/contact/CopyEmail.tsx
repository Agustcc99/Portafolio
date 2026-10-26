import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { site } from '../../config/site'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/cn'

/** Cuánto se queda el ícono de "copiado" antes de volver al de copiar (ms). */
const COPIED_MS = 2000

/** Copia al portapapeles; si la API no está disponible (contexto no seguro) cae a `execCommand`. */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    document.body.appendChild(field)
    field.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      field.remove()
    }
  }
}

/** Botón que copia el email y lo confirma con un aviso (`Toast`) y un cambio de ícono. */
export function CopyEmail({ className }: { className?: string }) {
  const { t } = useTranslation('home')
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleClick = async () => {
    const ok = await copyText(site.email)
    toast.show(ok ? t('contact.copied') : t('contact.copyFailed'), ok ? 'success' : 'error')
    if (!ok) return
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), COPIED_MS)
  }

  const Icon = copied ? Check : Copy

  return (
    <button
      type="button"
      onClick={handleClick}
      title={site.email}
      className={cn(
        'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill px-3 text-small font-medium text-text',
        'transition-colors duration-(--duration-base) hover:text-accent-text',
        className,
      )}
    >
      <Icon size={16} aria-hidden className={copied ? 'text-accent-text' : undefined} />
      {t('contact.copyEmail')}
      <span className="hidden font-mono text-label text-muted sm:inline">{site.email}</span>
    </button>
  )
}
