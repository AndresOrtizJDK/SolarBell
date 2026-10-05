import { useEffect, useState } from 'react'

/** Fecha actual que se renueva en cada segundo de reloj. */
export function useNow() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer: number
    const tick = () => {
      setNow(new Date())
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000))
    }
    timer = window.setTimeout(tick, 1000 - (Date.now() % 1000))
    return () => window.clearTimeout(timer)
  }, [])

  return now
}
