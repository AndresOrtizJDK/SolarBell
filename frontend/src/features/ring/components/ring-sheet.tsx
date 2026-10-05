import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { formatSeconds, totalMs } from '@/features/schedule/bell'
import { RingFields } from '@/features/schedule/components/ring-fields'
import type { RingConfig } from '@/features/schedule/types'
import { BellRing } from 'lucide-react'
import { useState } from 'react'

type RingSheetProps = {
  open: boolean
  initial: RingConfig
  onClose: () => void
  onRing: (config: RingConfig) => void
}

export function RingSheet({ open, initial, onClose, onRing }: RingSheetProps) {
  const [draft, setDraft] = useState(initial)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setDraft(initial)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tocar ahora"
      footer={
        <Button className="min-h-13 w-full rounded-full text-[1rem]" onClick={() => onRing(draft)}>
          <BellRing aria-hidden className="size-4.5" />
          Tocar {formatSeconds(totalMs(draft))} s
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <RingFields value={draft} onChange={setDraft} />
      </div>
    </Sheet>
  )
}
