export const easeOut = [0.23, 1, 0.32, 1] as const
export const easeInOut = [0.77, 0, 0.175, 1] as const

export const duration = {
  press: 0.12,
  ui: 0.2,
  enter: 0.24,
} as const

export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 38, mass: 0.8 },
  soft: { type: 'spring', stiffness: 280, damping: 32, mass: 0.9 },
} as const
