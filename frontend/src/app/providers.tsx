import { router } from '@/app/router'
import { Toaster } from '@/components/layout/toaster'
import { bootTheme } from '@/features/theme/store'
import { MotionConfig } from 'motion/react'
import { RouterProvider } from 'react-router'

bootTheme()

export function AppProviders() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
      <Toaster />
    </MotionConfig>
  )
}
