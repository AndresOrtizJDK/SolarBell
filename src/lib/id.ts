/** `crypto.randomUUID` no existe fuera de contextos seguros (el dev server por IP es http). */
export function createId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}
