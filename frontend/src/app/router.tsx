import { AppShell } from '@/components/layout/app-shell'
import { DevicePage } from '@/pages/device'
import { HistoryPage } from '@/pages/history'
import { HomePage } from '@/pages/home'
import { NotFoundPage } from '@/pages/not-found'
import { RingPage } from '@/pages/ring'
import { SchedulePage } from '@/pages/schedule'
import { SpecialDatesPage } from '@/pages/special-dates'
import { SpecialDateDetailPage } from '@/pages/special-dates/detail'
import { Navigate, createBrowserRouter } from 'react-router'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'horario', element: <SchedulePage /> },
      { path: 'tocar', element: <RingPage /> },
      { path: 'fechas', element: <SpecialDatesPage /> },
      { path: 'fechas/nueva', element: <Navigate to="/fechas" replace /> },
      { path: 'fechas/:id', element: <SpecialDateDetailPage /> },
      { path: 'historial', element: <HistoryPage /> },
      { path: 'campana', element: <DevicePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
