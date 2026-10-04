import { Button } from '@/components/ui/button'
import { DeleteHoldButton } from '@/components/ui/hold-button'

type FormActionsProps = {
  submitLabel: string
  form?: string
  submitDisabled?: boolean
  onDelete?: () => void
  deleteLabel?: string
}

export function FormActions({
  submitLabel,
  form,
  submitDisabled,
  onDelete,
  deleteLabel = 'Eliminar',
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
      {onDelete ? <DeleteHoldButton label={deleteLabel} onHold={onDelete} /> : null}
    </div>
  )
}
