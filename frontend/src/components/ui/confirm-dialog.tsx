import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  /** Pedido en curso: los dos botones quedan quietos hasta que termine. */
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Confirmación de una acción que no se puede deshacer. Un toque en «Eliminar» y listo. */
export function ConfirmDialog({
  open,
  title,
  description = 'Esta acción no se puede deshacer.',
  confirmLabel = 'Eliminar',
  busy,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="modal"
      onClose={onCancel}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel()
      }}
    >
      <div className="flex flex-col items-center gap-4 p-5 text-center">
        <span aria-hidden className="grid size-12 place-items-center rounded-full bg-field/10 text-field-ink">
          <Trash2 className="size-6" />
        </span>
        <div>
          <h2 id={titleId} className="text-[1.15rem] font-semibold tracking-[-0.02em]">
            {title}
          </h2>
          <p className="mt-1 text-[0.92rem] leading-snug text-muted">{description}</p>
        </div>
        <div className="flex w-full gap-2">
          {/* Cancelar va primero: es el que recibe el foco al abrir. */}
          <Button variant="line" className="min-h-12 flex-1 rounded-full" disabled={busy} onClick={onCancel}>
            Cancelar
          </Button>
          <Button className="min-h-12 flex-1 rounded-full" disabled={busy} onClick={onConfirm}>
            {busy ? 'Eliminando…' : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
