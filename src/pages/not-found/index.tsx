import { Page } from '@/components/layout/page'
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <Page className="items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold tracking-[-0.03em]">Esta pantalla no existe</h1>
      <Link
        to="/"
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-field px-5 font-medium text-on-field transition-transform duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.97]"
      >
        Volver al inicio
      </Link>
    </Page>
  )
}
