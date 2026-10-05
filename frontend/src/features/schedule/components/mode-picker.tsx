import { Segmented } from '@/components/ui/segmented'
import type { SpecialDateMode } from '@/features/schedule/types'

const options = [
  { value: 'custom', label: 'Horario especial' },
  { value: 'off', label: 'Sin timbrado' },
] as const

export function ModePicker({
  value,
  onChange,
}: {
  value: SpecialDateMode
  onChange: (mode: SpecialDateMode) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Segmented label="Ese día" value={value} onChange={onChange} options={options} />
      <p className="px-1 text-[0.88rem] leading-snug text-muted">
        {value === 'custom'
          ? 'Reemplaza el horario habitual solo ese día.'
          : 'La campana no suena en todo el día.'}
      </p>
    </div>
  )
}
