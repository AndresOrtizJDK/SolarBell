import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/ui/delete-button'
import type { ReactNode } from 'react'

type FormActionsProps = {
  submitLabel: string
  form?: string
  submitDisabled?: boolean
  onDelete?: () => void
  deleteLabel?: string
  /** Qué se va a borrar, para el modal de confirmación. */
  deleteDescription?: ReactNode
}

export function FormActions({
  submitLabel,
  form,
  submitDisabled,
  onDelete,
  deleteLabel = 'Eliminar',
  deleteDescription,
}: FormActionsProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Button
        type="submit"
        form={form}
        disabled={submitDisabled}
        className="min-h-13 flex-1 rounded-full text-[1rem]"
      >
        {submitLabel}
      </Button>
      {onDelete ? (
        <DeleteButton
          label={deleteLabel}
          title={`¿${deleteLabel}?`}
          description={deleteDescription}
          onConfirm={onDelete}
        />
      ) : null}
    </div>
  )
}
