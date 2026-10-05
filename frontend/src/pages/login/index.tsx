import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/ui/field'
import { signIn, useSession } from '@/features/session/store'
import { useThemeColor } from '@/hooks/use-theme-color'
import { errorText } from '@/lib/api'
import { cn } from '@/lib/cn'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useId, useState, type FocusEvent, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'

/** Solo en táctil: ahí el foco abre el teclado y el formulario tiene que subir. */
const TOUCH = '(pointer: coarse)'

const inputClass =
  'rounded-full pl-11 caret-blue focus:border-blue focus:ring-blue/20'
const iconClass =
  'pointer-events-none absolute inset-y-0 left-4 my-auto size-[1.15rem] text-muted'

export function LoginPage() {
  useThemeColor('--paper')
  const session = useSession()
  const navigate = useNavigate()
  const emailId = useId()
  const passwordId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [typing, setTyping] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (session) return <Navigate to="/" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    if (!email.trim() || !password) {
      setError('Escribe tu correo y contraseña')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(errorText(err))
      setSubmitting(false)
    }
  }

  const onFocus = () => {
    if (window.matchMedia(TOUCH).matches) setTyping(true)
  }

  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setTyping(false)
  }

  return (
    <main className="flex h-dvh flex-col overflow-y-auto overscroll-contain bg-paper px-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
      <div
        aria-hidden={typing}
        className={cn(
          'flex min-h-0 basis-0 flex-col items-center justify-end overflow-hidden transition-[flex-grow,opacity,translate] duration-[280ms] ease-[var(--ease-drawer)]',
          typing ? 'grow-0 -translate-y-3 opacity-0' : 'grow opacity-100',
        )}
      >
        <img
          src="/login-scene.svg"
          alt=""
          width={985}
          height={866}
          decoding="async"
          className="min-h-0 w-full max-w-72 shrink object-contain"
        />
        <p className="mt-5 max-w-[19rem] shrink-0 text-center text-[1rem] leading-snug text-muted">
          Programa los timbrados y toca la campana solar desde tu teléfono, estés donde estés.
        </p>
      </div>

      <form
        noValidate
        onSubmit={submit}
        onFocus={onFocus}
        onBlur={onBlur}
        className="mx-auto flex w-full max-w-sm shrink-0 flex-col gap-3 pt-8"
      >
        <h1 className="mb-2 text-center text-[1.6rem] leading-none font-semibold tracking-[-0.03em] text-ink">
          Ingresar
        </h1>

        <div className="relative">
          <label htmlFor={emailId} className="sr-only">
            Correo
          </label>
          <Mail aria-hidden className={iconClass} />
          <TextInput
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoCapitalize="none"
            enterKeyHint="next"
            placeholder="Correo"
            className={inputClass}
          />
        </div>

        <div className="relative">
          <label htmlFor={passwordId} className="sr-only">
            Contraseña
          </label>
          <Lock aria-hidden className={iconClass} />
          <TextInput
            id={passwordId}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            enterKeyHint="go"
            placeholder="Contraseña"
            className={cn(inputClass, 'pr-12')}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={showPassword}
            aria-controls={passwordId}
            // Mantiene el foco en el input para que el teclado no se cierre.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-1 grid w-11 place-items-center rounded-full text-muted transition-[color,scale] duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-90 hover:text-ink"
          >
            {showPassword ? (
              <EyeOff aria-hidden className="size-[1.15rem]" />
            ) : (
              <Eye aria-hidden className="size-[1.15rem]" />
            )}
          </button>
        </div>

        {error && (
          <p role="alert" className="px-4 text-center text-[0.9rem] text-field-ink">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="blue"
          disabled={submitting}
          aria-busy={submitting}
          className="mt-3 min-h-13 rounded-full text-[1rem]"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </main>
  )
}
