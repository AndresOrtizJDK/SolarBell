import { Button } from '@/components/ui/button'
import { WifiSheet } from '@/features/device/components/wifi-sheet'
import { useDevice } from '@/features/device/store'
import { forgetWifi, getWifi, type WifiStatus } from '@/features/device/wifi'
import { toast } from '@/features/feedback/toast'
import { DeviceError, errorText } from '@/lib/device'
import { useCallback, useEffect, useState } from 'react'

const RECONNECT_POLL_MS = 3000

function describe(wifi: WifiStatus) {
  switch (wifi.state) {
    case 'connected':
      return `Unida a «${wifi.ssid}»${wifi.ip ? ` · ${wifi.ip}` : ''}`
    case 'connecting':
      return `Uniéndose a «${wifi.ssid}»…`
    case 'failed':
      return `No pudo unirse a «${wifi.ssid}»${wifi.error ? `: ${wifi.error}` : ''}`
    default:
      return 'Sin red guardada'
  }
}

/** Wi-Fi de casa de la campana: qué red tiene y cuál elegir, sin tocar el firmware. */
export function WifiCard() {
  const { link } = useDevice()
  const near = link === 'near'
  const [wifi, setWifi] = useState<WifiStatus | null>(null)
  const [unsupported, setUnsupported] = useState(false)
  const [open, setOpen] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setWifi(await getWifi())
      setUnsupported(false)
    } catch (error) {
      if (error instanceof DeviceError && error.status === 404) setUnsupported(true)
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react-hooks/set-state-in-effect
    if (near) void refresh()
  }, [near, refresh])

  const reconnecting = wifi?.state === 'connecting'
  useEffect(() => {
    if (!near || !reconnecting) return
    const timer = window.setInterval(() => void refresh(), RECONNECT_POLL_MS)
    return () => window.clearInterval(timer)
  }, [near, reconnecting, refresh])

  async function forget() {
    try {
      setWifi(await forgetWifi())
      toast('Red olvidada')
    } catch (error) {
      toast(errorText(error), 'danger')
    }
  }

  return (
    <section className="mt-4 rounded-[1.75rem] bg-raised px-5 py-4 shadow-raised">
      <p className="text-[0.98rem] font-medium">Wi-Fi de casa</p>
      {unsupported ? (
        <p className="mt-1 text-[0.92rem] leading-relaxed text-muted">
          Esta campana tiene un firmware anterior a la 0.6: actualízalo para elegir su Wi-Fi desde aquí.
        </p>
      ) : !near ? (
        <p className="mt-1 text-[0.92rem] leading-relaxed text-muted">
          Conéctate a la campana para elegir a qué red se une.
        </p>
      ) : (
        <>
          <p className="mt-1 text-[0.92rem] leading-relaxed text-muted">
            {wifi ? describe(wifi) : 'Leyendo…'}
          </p>
          <p className="mt-1 text-[0.86rem] leading-snug text-muted">
            Con una red guardada, la app encuentra la campana sola en esa red (también como{' '}
            {wifi?.hostname ?? 'solarbell.local'}).
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="soft" onClick={() => setOpen(true)}>
              {wifi && wifi.state !== 'none' ? 'Cambiar red' : 'Elegir red'}
            </Button>
            {wifi && wifi.state !== 'none' ? (
              <Button variant="ghost" onClick={() => void forget()}>
                Olvidar
              </Button>
            ) : null}
          </div>
        </>
      )}
      <WifiSheet
        open={open}
        onClose={() => {
          setOpen(false)
          void refresh()
        }}
        onJoined={(ssid, ip) => {
          setOpen(false)
          toast(ip ? `Campana unida a ${ssid} (${ip})` : `Campana unida a ${ssid}`)
          void refresh()
        }}
      />
    </section>
  )
}
