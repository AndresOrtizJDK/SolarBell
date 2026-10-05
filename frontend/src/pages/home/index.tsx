import { NAV_CLEARANCE } from '@/components/layout/page'
import { NextBellHero } from '@/features/schedule/components/next-bell-hero'
import { TodayCard } from '@/features/schedule/components/today-card'
import { formatLongDate } from '@/features/schedule/format'
import { useSchedule } from '@/features/schedule/store'
import {
  dayPlan,
  previousBefore,
  upcomingFrom,
  upcomingSpecials,
} from '@/features/schedule/upcoming'
import { useNow } from '@/hooks/use-now'
import { useThemeColor } from '@/hooks/use-theme-color'
import { cn } from '@/lib/cn'

export function HomePage() {
  useThemeColor('--hero')
  const now = useNow()
  const state = useSchedule()

  const upcoming = upcomingFrom(state, now, 1)
  const previous = previousBefore(state, now)
  const plan = dayPlan(state, now)
  const specials = upcomingSpecials(state, now)

  return (
    <div className={cn('flex flex-1 flex-col', NAV_CLEARANCE)}>
      <div className="bg-paper pt-[env(safe-area-inset-top,0px)] text-hero-ink">
        <div className="mx-auto w-full max-w-lg pb-16">
          <header className="px-4 pt-3 text-center">
            <p className="text-[1.02rem] font-semibold">Hoy</p>
            <p className="text-[0.82rem] text-hero-ink/75">{formatLongDate(now)}</p>
          </header>

          <div className="mt-8">
            <NextBellHero now={now} upcoming={upcoming} previous={previous} />
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-8 w-full max-w-lg px-4">
        <TodayCard now={now} plan={plan} upcomingSpecials={specials.length} />
      </div>
    </div>
  )
}
