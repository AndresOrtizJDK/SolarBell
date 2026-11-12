import { Sheet } from '@/components/ui/sheet'
import { PasswordModal, type PasswordTarget } from '@/features/device/components/password-modal'
import { SignalIcon } from '@/features/device/components/signal-icon'
import { getWifi, joinWifi, scanWifi, signalBars, type WifiNetwork } from '@/features/device/wifi'
import { cn } from '@/lib/cn'
import { errorText, setLanAddress } from '@/lib/device'
import { ChevronRight, Lock, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const SCAN_POLL_MS = 1500
const SCAN_TRIES = 10
const JOIN_POLL_MS = 1500
/** Más que el límite del firmware (30 s) para cubrir los cortes mientras el punto de acceso cambia de canal. */
const JOIN_MAX_MS = 50_000

type WifiSheetProps = {
  open: boolean
  onClose: () => void
  /** La campana quedó unida a la red; `ip` es la que le dio el router. */
  onJoined: (ssid: string, ip: string | null) => void
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

export function WifiSheet({ open, onClose, onJoined }: WifiSheetProps) {
  const [networks, setNetworks] = useState<WifiNetwork[]>([])
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  /** Red cuyo modal de clave está abierto. */
  const [target, setTarget] = useState<PasswordTarget | null>(null)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  // Cada escaneo o unión nueva invalida el anterior (p. ej. al cerrar la hoja o el modal).
  const scanRun = useRef(0)
  const joinRun = useRef(0)

  const scan = useCallback(async () => {
    const id = ++scanRun.current
    setScanning(true)
    setScanError(null)
    try {
      for (let i = 0; i < SCAN_TRIES; i++) {
        const result = await scanWifi()
        if (scanRun.current !== id) return
        if (!result.scanning) {
          setNetworks(result.networks)
          return
        }
        await wait(SCAN_POLL_MS)
        if (scanRun.current !== id) return
      }
      setScanError('No se pudo terminar la búsqueda')
    } catch (error) {
      if (scanRun.current === id) setScanError(errorText(error))
    } finally {
      if (scanRun.current === id) setScanning(false)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      scanRun.current++
      joinRun.current++
      // oxlint-disable-next-line react-hooks/set-state-in-effect
      setTarget(null)
      setJoining(false)
      return
    }
    void scan()
  }, [open, scan])

  function pick(next: PasswordTarget) {
    setJoinError(null)
    setTarget(next)
  }

  function cancelJoin() {
    // La campana sigue con su intento; solo se deja de esperar la respuesta aquí.
    joinRun.current++
    setJoining(false)
    setJoinError(null)
    setTarget(null)
  }

  async function join(ssid: string, password: string) {
    const id = ++joinRun.current
    setJoining(true)
    setJoinError(null)
    try {
      await joinWifi(ssid, password)
      const deadline = Date.now() + JOIN_MAX_MS
      while (Date.now() < deadline) {
        await wait(JOIN_POLL_MS)
        if (joinRun.current !== id) return
        try {
          // Al unirse al router la red de la campana cambia de canal y el teléfono puede perderla un momento.
          const status = await getWifi()
          if (joinRun.current !== id) return
          if (status.state === 'connected' && status.ssid === ssid) {
            if (status.ip) setLanAddress(`http://${status.ip}`)
            setTarget(null)
            onJoined(status.ssid, status.ip)
            return
          }
          if (status.state === 'failed') {
            setJoinError(status.error ?? 'No se pudo unir a la red')
            return
          }
        } catch {
          // Sigue intentando hasta el límite.
        }
      }
      setJoinError('La campana no contestó. Revisa que sigas en su red y vuelve a intentar.')
    } catch (error) {
      if (joinRun.current === id) setJoinError(errorText(error))
    } finally {
      if (joinRun.current === id) setJoining(false)
    }
  }

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Wi-Fi de la campana">
        <p className="text-[0.92rem] leading-relaxed text-muted">
          Toca la red a la que se unirá la campana (solo 2,4 GHz). Seguirás conectado a su red{' '}
          <span className="font-medium text-ink">SolarBell</span>.
        </p>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[0.88rem] font-medium text-muted">Redes cercanas</p>
          <button
            type="button"
            onClick={() => void scan()}
            disabled={scanning}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-[0.88rem] font-medium text-ink transition-opacity disabled:opacity-50"
          >
            <RefreshCw aria-hidden className={cn('size-4', scanning && 'animate-spin')} />
            {scanning ? 'Buscando…' : 'Buscar de nuevo'}
          </button>
        </div>

        {scanError ? (
          <p role="alert" className="mt-2 text-[0.88rem] text-field-ink">
            {scanError}
          </p>
        ) : null}

        <ul className="mt-1 overflow-hidden rounded-3xl bg-surface">
          {networks.map((network) => (
            <li key={network.ssid} className="border-b border-line/60 last:border-b-0">
              <button
                type="button"
                onClick={() => pick({ ssid: network.ssid, secure: network.secure })}
                className="flex min-h-13 w-full items-center gap-3 px-4 text-left transition-colors active:bg-solar/15"
              >
                <SignalIcon level={signalBars(network.rssi)} className="text-ink" />
                <span className="min-w-0 flex-1 truncate text-[0.98rem]">{network.ssid}</span>
                {network.secure ? <Lock aria-label="Con clave" className="size-4 shrink-0 text-muted" /> : null}
                <ChevronRight aria-hidden className="size-4 shrink-0 text-muted" />
              </button>
            </li>
          ))}
          {!scanning && networks.length === 0 && !scanError ? (
            <li className="px-4 py-4 text-[0.92rem] text-muted">No se encontraron redes.</li>
          ) : null}
        </ul>

        <button
          type="button"
          onClick={() => pick({ manual: true })}
          className="mt-2 min-h-11 rounded-full px-3 text-[0.9rem] font-medium text-ink"
        >
          Escribir el nombre a mano (red oculta)
        </button>
      </Sheet>

      <PasswordModal
        target={target}
        joining={joining}
        error={joinError}
        onCancel={cancelJoin}
        onSubmit={(ssid, password) => void join(ssid, password)}
      />
    </>
  )
}
