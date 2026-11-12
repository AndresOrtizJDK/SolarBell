import { Button } from '@/components/ui/button'
import { Field, TextInput } from '@/components/ui/field'
import { cn } from '@/lib/cn'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'

/** Red elegida en la lista, o `manual` para escribir el nombre de una red oculta. */
export type PasswordTarget = { ssid: string; secure: boolean } | { manual: true }

type PasswordModalProps = {
  target: PasswordTarget | null
  joining: boolean
  error: string | null
  onCancel: () => void
  onSubmit: (ssid: string, password: string) => void
}

const MIN_KEY = 8
const MAX_KEY = 63

/** Modal flotante para la clave de la red, con botón para ver lo que se escribe. */
export function PasswordModal({ target, joining, error, onCancel, onSubmit }: PasswordModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const open = target !== null
  const manual = target !== null && 'manual' in target
  const secure = manual || (target !== null && target.secure)

  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [lastTarget, setLastTarget] = useState(target)

  // Red nueva: clave vacía y oculta otra vez.
  if (target !== lastTarget) {
    setLastTarget(target)
    if (target) {
      setSsid(manual ? '' : (target as { ssid: string }).ssid)
      setPassword('')
      setVisible(false)
    }
  }

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const tooShort = secure && password.length > 0 && password.length < MIN_KEY
  const canSubmit = ssid.trim().length > 0 && (!secure || password.length >= MIN_KEY) && !joining

  function submit(event: FormEvent) {
    event.preventDefault()
    if (canSubmit) onSubmit(ssid, secure ? password : '')
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="modal"
      onClose={onCancel}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <form onSubmit={submit} className="flex flex-col gap-4 p-5">
        <div>
          <h2 id={titleId} className="text-[1.15rem] font-semibold tracking-[-0.02em]">
            {manual ? 'Red oculta' : ssid}
          </h2>
          <p className="mt-0.5 text-[0.9rem] text-muted">
            {secure ? 'Escribe la clave de la red' : 'Red abierta, sin clave'}
          </p>
        </div>

        {manual ? (
          <Field label="Nombre de la red" htmlFor="wifi-ssid">
            <TextInput
              id="wifi-ssid"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              maxLength={32}
              value={ssid}
              disabled={joining}
              onChange={(e) => setSsid(e.target.value)}
            />
          </Field>
        ) : null}

        {secure ? (
          <Field
            label="Clave"
            htmlFor="wifi-password"
            hint={`De ${MIN_KEY} a ${MAX_KEY} caracteres.`}
            error={tooShort ? `La clave tiene al menos ${MIN_KEY} caracteres` : null}
          >
            <div className="relative">
              <TextInput
                id="wifi-password"
                autoFocus={!manual}
                type={visible ? 'text' : 'password'}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                maxLength={MAX_KEY}
                value={password}
                disabled={joining}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Ocultar clave' : 'Mostrar clave'}
                aria-pressed={visible}
                aria-controls="wifi-password"
                className={cn(
                  'absolute inset-y-0 right-1 my-auto grid size-10 place-items-center rounded-full text-muted',
                  'transition-transform duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.92]',
                )}
              >
                {visible ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
              </button>
            </div>
          </Field>
        ) : null}

        {error ? (
          <p role="alert" className="text-[0.9rem] text-field-ink">
            {error}
          </p>
        ) : null}
        {joining ? (
          <p className="text-[0.86rem] leading-snug text-muted">
            Uniéndose… Si el teléfono pierde la red SolarBell un momento, es normal.
          </p>
        ) : null}

        <div className="flex gap-2">
          <Button variant="soft" className="flex-1 rounded-full" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 rounded-full" disabled={!canSubmit}>
            {joining ? 'Uniéndose…' : 'Conectar'}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
