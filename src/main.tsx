import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AppContainerProvider } from './app/providers/AppContainerProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppContainerProvider>
      <App />
    </AppContainerProvider>
  </StrictMode>,
)
