import { cn } from '@/lib/cn'
import { spring } from '@/lib/motion'
import { BellRing, CalendarDays, Clock3, History, House, Wifi } from 'lucide-react'
import { motion } from 'motion/react'
import { NavLink } from 'react-router'

const items = [
  { to: '/', label: 'Inicio', icon: House, end: true },
  { to: '/horario', label: 'Horario', icon: Clock3, end: false },
  { to: '/tocar', label: 'Tocar', icon: BellRing, end: false },
  { to: '/fechas', label: 'Fechas', icon: CalendarDays, end: false },
  { to: '/historial', label: 'Historial', icon: History, end: false },
  { to: '/campana', label: 'Campana', icon: Wifi, end: false },
] as const

export function BottomNav() {
  return (
    <nav
      aria-label="Principal"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
    >
      <ul className="pointer-events-auto mx-auto grid h-[4.25rem] w-full max-w-md grid-cols-6 gap-0.5 rounded-full border border-line/60 bg-raised/90 p-1.5 shadow-float backdrop-blur-xl dark:bg-raised/85">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="h-full">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'tab relative flex h-full flex-col items-center justify-center gap-0.5 rounded-full text-[0.68rem] font-medium transition-[color,transform] duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.95]',
                  isActive ? 'text-ink' : 'text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <motion.span
                      layoutId="nav-pill"
                      transition={spring.snappy}
                      className="absolute inset-0 rounded-full bg-surface dark:bg-white/8"
                    />
                  ) : null}
                  <Icon
                    aria-hidden
                    strokeWidth={isActive ? 2.3 : 1.8}
                    className="relative size-[1.3rem]"
                  />
                  <span className="relative">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
