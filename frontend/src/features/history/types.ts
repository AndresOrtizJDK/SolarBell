export type HistorySource = 'manual' | 'scheduled'

/** `completed`: terminó sola. `stopped`: la detuvo alguien. `replaced`: la cortó un toque nuevo. */
export type HistoryOutcome = 'completed' | 'stopped' | 'replaced'

/** Un toque que ya terminó, tal como lo guarda la campana (`GET /api/history`). */
export type HistoryEntry = {
  id: number
  /** ms epoch en que se pidió el toque; `null` si la campana no tenía la hora puesta. */
  at: number | null
  source: HistorySource
  outcome: HistoryOutcome
  /** Vacío en un toque manual o en un timbrado sin nombre. */
  label: string
  /** ms que estuvo sonando de verdad (sin el arranque del inversor). */
  soundedMs: number
  /** ms de cada toque del patrón planeado. */
  durations: number[]
  /** ms de silencio tras cada toque menos el último. */
  pauses: number[]
}

export type HistoryPage = {
  /** Registros guardados en la campana (sin los borrados). */
  total: number
  /** Cuántos caben antes de que empiece a borrar los más viejos. */
  capacity: number
  records: HistoryEntry[]
  /** `before` del pedido siguiente; `null` si no queda nada por revisar. */
  next: number | null
}

export type HistoryQuery = {
  /** Parte del nombre. */
  text: string
  /** ms epoch, ambos extremos incluidos. */
  from: number | null
  to: number | null
}
