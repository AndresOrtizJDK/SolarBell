import {
  Toast,
  ToastClose,
  ToastIndicator,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { TOAST_DURATION_MS, useFeedbackToast, type FeedbackToast } from '@/features/feedback/toast'
import { useState } from 'react'

export function Toaster() {
  const message = useFeedbackToast()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<FeedbackToast | null>(null)

  if (message && message.id !== active?.id) {
    setActive(message)
    setOpen(true)
  }

  return (
    <ToastProvider duration={TOAST_DURATION_MS} swipeDirection="up" label="Avisos">
      {active ? (
        <Toast
          key={active.id}
          appearance="compact"
          variant="cream"
          open={open}
          onOpenChange={setOpen}
        >
          <ToastIndicator tone={active.tone} />
          <ToastTitle>{active.title}</ToastTitle>
          <ToastClose aria-label="Cerrar aviso" />
        </Toast>
      ) : null}
      <ToastViewport />
    </ToastProvider>
  )
}
