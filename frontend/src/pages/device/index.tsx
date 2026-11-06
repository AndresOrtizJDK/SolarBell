import { Page } from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import { Field, TextInput } from '@/components/ui/field'
import { Segmented } from '@/components/ui/segmented'
import { recheckDevice, useDevice, type DeviceState } from '@/features/device/store'
import { setTheme, useTheme } from '@/features/theme/store'
import { useNow } from '@/hooks/use-now'
import { cn } from '@/lib/cn'
import { DEVICE_NETWORK, deviceAddress, setDeviceAddress } from '@/lib/device'
import { useState, type ReactNode } from 'react'

const appearance = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
] as const

const relative = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' })

function sinceText(from: number, now: number) {
  const minutes = Math.round((now - from) / 60_000)
  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return relative.format(-minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (hours < 24) return relative.format(-hours, 'hour')
  return relative.format(-Math.round(hours / 24), 'day')
}

function linkText({ link, lastSeen }: DeviceState, now: number) {
  if (link === 'near') return 'Conectada'
  if (link === 'checking') return 'Buscando…'
  return lastSeen ? `Fuera de alcance, vista ${sinceText(lastSeen, now)}` : 'Fuera de alcance'
}

export function DevicePage() {
  const theme = useTheme()
  const state = useDevice()
  const now = useNow().getTime()
  const status = state.link === 'near' ? state.status : null
  const [address, setAddress] = useState(deviceAddress)

  function saveAddress() {
    setDeviceAddress(address)
    setAddress(deviceAddress())
    recheckDevice()
  }

  return (
    <Page>
      <h1 className="sr-only">Campana</h1>
      <div aria-hidden className="h-16" />

      <section className="rounded-[1.75rem] bg-raised px-5 py-2 shadow-raised">
        <Row label="Estado">
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className={cn(
                'size-2 rounded-full',
                state.link === 'near' ? 'bg-solar' : state.link === 'away' ? 'bg-field-ink' : 'bg-muted',
              )}
            />
            {linkText(state, now)}
          </span>
        </Row>
        <Row label="Reloj">
          {status ? (status.clockSet ? 'En hora' : 'Sin hora') : '—'}
        </Row>
        <Row label="Firmware">{status?.firmware ?? '—'}</Row>
      </section>

      <section className="mt-4 rounded-[1.75rem] bg-raised px-5 py-4 shadow-raised">
        <p className="text-[0.98rem] font-medium">Cómo conectarse</p>
        <p className="mt-1 text-[0.92rem] leading-relaxed text-muted">
          Cerca de la campana, únete a la red Wi-Fi <span className="font-medium text-ink">{DEVICE_NETWORK}</span>.
          No necesita internet: si el teléfono avisa que la red no tiene conexión, elige seguir conectado.
        </p>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">
          El horario queda guardado en la campana y suena solo, aunque te vayas. Al conectarte, la app
          la pone en la hora del teléfono.
        </p>
      </section>

      <section className="mt-4 rounded-[1.75rem] bg-raised px-5 py-4 shadow-raised">
        <Field
          label="Dirección de la campana"
          htmlFor="device-address"
          hint="192.168.4.1 en su red SolarBell. Si la campana está en el Wi-Fi de casa, escribe su IP (la muestra el monitor serie)."
        >
          <TextInput
            id="device-address"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="http://192.168.4.1"
          />
        </Field>
        <Button className="mt-3" variant="soft" onClick={saveAddress}>
          Guardar y buscar
        </Button>
      </section>

      <section className="mt-4 rounded-[1.75rem] bg-raised px-5 py-4 shadow-raised">
        <p className="text-[0.98rem] font-medium">Apariencia</p>
        <p className="mt-0.5 text-[0.88rem] leading-snug text-muted">Claro u oscuro en este dispositivo</p>
        <div className="mt-3">
          <Segmented label="Apariencia" value={theme} onChange={setTheme} options={appearance} />
        </div>
      </section>
    </Page>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 border-b border-line/60 py-2 last:border-b-0">
      <span className="text-[0.95rem] text-muted">{label}</span>
      <span className="text-right text-[0.95rem] font-medium">{children}</span>
    </div>
  )
}
