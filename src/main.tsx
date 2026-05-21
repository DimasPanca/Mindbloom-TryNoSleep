import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProfileProvider } from '@/contexts/ProfileContext'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ProfileProvider>
            <App />
          </ProfileProvider>
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </AppThemeProvider>
  </StrictMode>,
)
