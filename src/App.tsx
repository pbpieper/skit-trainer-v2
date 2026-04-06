import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/design/theme'
import { ServiceProvider } from '@/services/ServiceProvider'
import { UserProvider } from '@/context/UserContext'
import { StarProvider } from '@/context/StarContext'
import { AppProvider } from '@/context/AppContext'
import { SkitProvider } from '@/context/SkitContext'
import { ProgressProvider } from '@/context/ProgressContext'
import { GoalProvider } from '@/context/GoalContext'
import { AppShell } from '@/components/layout/AppShell'

export default function App() {
  return (
    <ThemeProvider>
      <ServiceProvider>
        <UserProvider>
          <StarProvider>
            <AppProvider>
              <SkitProvider>
                <ProgressProvider>
                  <GoalProvider>
                    <AppShell />
                    <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />
                  </GoalProvider>
                </ProgressProvider>
              </SkitProvider>
            </AppProvider>
          </StarProvider>
        </UserProvider>
      </ServiceProvider>
    </ThemeProvider>
  )
}
