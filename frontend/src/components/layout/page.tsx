import { cn } from '@/lib/cn'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

export const NAV_CLEARANCE = 'pb-[calc(7rem+env(safe-area-inset-bottom,0px))]'

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]',
        NAV_CLEARANCE,
        className,
      )}
    >
      {children}
    </div>
  )
}

type PageHeaderProps = {
  title?: string
  description?: ReactNode
  back?: { to: string; label: string }
  backAside?: ReactNode
  action?: ReactNode
}

export function PageHeader({ title, description, back, backAside, action }: PageHeaderProps) {
  if (!back && !title && !description && !action) return null

  return (
    <header className="mb-6">
      {back ? (
        <div className="mb-2 flex justify-between gap-3">
          <Link
            to={back.to}
            className="-ml-2 inline-flex min-h-11 gap-0.5 rounded-full pr-3 pl-1 text-[0.95rem] font-medium text-muted transition-transform duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.97]"
          >
            <ChevronLeft aria-hidden className="size-5" />
            {back.label}
          </Link>
          {backAside}
        </div>
      ) : null}
      {title || action ? (
        <div className={cn('flex min-w-0 gap-4', title ? 'items-start justify-between' : 'justify-end')}>
          {title ? (
            <h1 className="min-w-0 truncate text-[2rem] leading-tight font-semibold tracking-[-0.03em]">
              {title}
            </h1>
          ) : null}
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {description ? (
        <p className="mt-1.5 max-w-[40ch] text-[0.98rem] leading-relaxed text-muted">{description}</p>
      ) : null}
    </header>
  )
}

export function Section({
  title,
  aside,
  children,
}: {
  title: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mt-7 first:mt-0">
      <div className="mb-2.5 flex items-baseline justify-between gap-3 px-1">
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.015em]">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}
