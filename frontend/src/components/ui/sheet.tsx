import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

type SheetProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
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
      className="sheet"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[inherit] min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-3 pb-2">
          <span aria-hidden className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-line md:hidden" />
          <h2 id={titleId} className="pt-3 text-[1.2rem] font-semibold tracking-[-0.02em]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="mt-2 grid size-10 place-items-center rounded-full bg-surface text-muted transition-transform duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.94]"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <div
          className={
            footer
              ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-4'
              : 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]'
          }
        >
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-line/60 bg-raised px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  )
}
