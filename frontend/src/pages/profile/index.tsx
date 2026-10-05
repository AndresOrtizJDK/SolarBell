import { Page } from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import { Field, TextInput } from '@/components/ui/field'
import { Segmented } from '@/components/ui/segmented'
import { toast } from '@/features/feedback/toast'
import { initials, rename, signOut, useSession } from '@/features/session/store'
import { setTheme, useTheme } from '@/features/theme/store'
import { errorText } from '@/lib/api'
import { LogOut } from 'lucide-react'
import { useId, useState } from 'react'
import { useNavigate } from 'react-router'

const appearance = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
] as const

export function ProfilePage() {
  const session = useSession()
  const theme = useTheme()
  const navigate = useNavigate()
  const name = session?.name ?? ''

  return (
    <Page>
      <section className="flex flex-col items-center rounded-[1.75rem] bg-raised px-5 pt-8 pb-6 text-center shadow-raised">
        <span className="grid size-20 place-items-center rounded-full bg-field text-[1.7rem] font-semibold tracking-[-0.02em] text-on-field">
          {initials(name)}
        </span>
        <h2 className="mt-4 text-[1.4rem] font-semibold tracking-[-0.02em]">{name}</h2>
        <p className="mt-0.5 text-[0.92rem] text-muted">{session?.email}</p>
      </section>

      <section className="mt-4 rounded-[1.75rem] bg-raised px-5 py-4 shadow-raised">
        <NameField key={name} initial={name} />
      </section>

      <section className="mt-4 rounded-[1.75rem] bg-raised px-5 py-4 shadow-raised">
        <p className="text-[0.98rem] font-medium">Apariencia</p>
        <p className="mt-0.5 text-[0.88rem] leading-snug text-muted">Claro u oscuro en este dispositivo</p>
        <div className="mt-3">
          <Segmented
            label="Apariencia"
            value={theme}
            onChange={setTheme}
            options={appearance}
          />
        </div>
      </section>

      <Button
        variant="line"
        className="mt-4 min-h-13 w-full rounded-full text-[1rem]"
        onClick={() => {
          signOut()
          navigate('/ingresar', { replace: true })
        }}
      >
        <LogOut aria-hidden className="size-4.5" />
        Cerrar sesión
      </Button>
    </Page>
  )
}

function NameField({ initial }: { initial: string }) {
  const id = useId()
  const [value, setValue] = useState(initial)

  const save = () => {
    const next = value.trim()
    if (!next || next === initial) {
      setValue(initial)
      return
    }
    rename(next).then(
      () => toast('Nombre guardado'),
      (error: unknown) => {
        setValue(initial)
        toast(errorText(error), 'danger')
      },
    )
  }

  return (
    <Field label="Nombre" htmlFor={id}>
      <TextInput
        id={id}
        value={value}
        maxLength={60}
        autoComplete="name"
        enterKeyHint="done"
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
      />
    </Field>
  )
}
