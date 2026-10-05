import { BottomNav } from '@/components/layout/bottom-nav'
import { startDeviceSync, stopDeviceSync } from '@/features/device/store'
import { useEffect } from 'react'
import { Outlet } from 'react-router'

export function AppShell() {
  useEffect(() => {
    startDeviceSync()
    return stopDeviceSync
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
