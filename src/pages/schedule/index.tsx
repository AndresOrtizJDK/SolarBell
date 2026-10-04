import { Page, Section } from '@/components/layout/page'
import { BellList } from '@/features/schedule/components/bell-list'
import { WeekdayDisplay } from '@/features/schedule/components/weekday-display'
import { WEEKDAYS } from '@/features/schedule/format'
import { useSchedule } from '@/features/schedule/store'

function describeDays(days: number[]) {
  if (days.length === 0) return 'Ningún día activo'
  if (days.length === 7) return 'Todos los días'
  const workweek = [1, 2, 3, 4, 5]
  if (days.length === 5 && workweek.every((d) => days.includes(d))) return 'Lunes a viernes'
  return WEEKDAYS.filter((w) => days.includes(w.day))
    .map((w) => w.name)
    .join(', ')
}

export function SchedulePage() {
  const { weekly } = useSchedule()

  return (
    <Page>
      <Section title="Días con timbrado" aside={<span className="text-[0.88rem] text-muted">{describeDays(weekly.days)}</span>}>
        <WeekdayDisplay value={weekly.days.filter((day) => day >= 1 && day <= 5)} />
      </Section>

      <Section
        title="Timbrados"
        aside={<span className="font-mono text-[0.82rem] text-muted">{weekly.bells.length}</span>}
      >
        <BellList scope={{ kind: 'weekly' }} bells={weekly.bells} />
      </Section>
    </Page>
  )
}
