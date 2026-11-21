import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'

type DeleteButtonProps = {
  /** Texto para lectores de pantalla del icono. */
  label: string
  /** Pregunta del modal, p. ej. «¿Eliminar timbrado?». */
  title: string
  description?: ReactNode
  onConfirm: () => void | Promise<void>
}

/** Icono de basura que pide confirmación en un modal antes de borrar. */
export function DeleteButton({ label, title, description, onConfirm }: DeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function confirm() {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
      setOpen(false)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        className="grid size-13 shrink-0 place-items-center rounded-full border border-line bg-raised text-muted transition-[transform,color] duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.94] active:text-field-ink"
      >
        <Trash2 aria-hidden className="size-5" />
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        description={description}
        busy={busy}
        onConfirm={() => void confirm()}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
