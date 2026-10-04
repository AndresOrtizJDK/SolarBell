import { BottomNav } from '@/components/layout/bottom-nav'
import { useSession } from '@/features/session/store'
import { Navigate, Outlet } from 'react-router'

export function AppShell() {
  const session = useSession()
  if (!session) return <Navigate to="/ingresar" replace />

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
