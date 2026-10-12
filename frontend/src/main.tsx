import { AppProviders } from '@/app/providers'
import '@/lib/lottie'
import '@/styles/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Missing #root')
}

createRoot(root).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
