import { AppShell } from '@/components/layout/app-shell'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { ProfilePage } from '@/pages/profile'
import { RingPage } from '@/pages/ring'
import { SchedulePage } from '@/pages/schedule'
import { SpecialDatesPage } from '@/pages/special-dates'
import { SpecialDateDetailPage } from '@/pages/special-dates/detail'
import { Navigate, createBrowserRouter } from 'react-router'

export const router = createBrowserRouter([
  { path: '/ingresar', element: <LoginPage /> },
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
      { path: 'perfil', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
