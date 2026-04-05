import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/design/theme'
import { ServiceProvider } from '@/services/ServiceProvider'
import { UserProvider } from '@/context/UserContext'
import { AppProvider } from '@/context/AppContext'
import { SkitProvider } from '@/context/SkitContext'
import { ProgressProvider } from '@/context/ProgressContext'
import { AppShell } from '@/components/layout/AppShell'

export default function App() {
  return (
    <ThemeProvider>
      <ServiceProvider>
        <UserProvider>
          <AppProvider>
            <SkitProvider>
              <ProgressProvider>
                <AppShell />
                <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />
              </ProgressProvider>
            </SkitProvider>
          </AppProvider>
        </UserProvider>
      </ServiceProvider>
    </ThemeProvider>
  )
}
