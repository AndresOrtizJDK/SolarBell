import { BottomNav } from '@/components/layout/bottom-nav'
import { refreshRing } from '@/features/ring/store'
import { refreshSchedule } from '@/features/schedule/store'
import { refreshSession, useSession } from '@/features/session/store'
import { connectLive, disconnectLive } from '@/lib/live'
import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router'

export function AppShell() {
  const session = useSession()
  const userId = session?.id

  useEffect(() => {
    if (userId === undefined) return
    void refreshSession().catch(() => {})
    void refreshSchedule()
    void refreshRing().catch(() => {})
    connectLive()
    return disconnectLive
  }, [userId])

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
