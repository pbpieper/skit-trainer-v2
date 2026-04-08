import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { SkitProgress } from '@/types/progress'
import { createEmptyProgress } from '@/types/progress'
import { useServices } from '@/services/ServiceProvider'
import { useUser } from '@/context/UserContext'
import { useApp } from '@/context/AppContext'

interface ProgressContextValue {
  progress: SkitProgress
  setProgress: (fn: (prev: SkitProgress) => SkitProgress) => void
}

const ProgressCtx = createContext<ProgressContextValue>({
  progress: createEmptyProgress(),
  setProgress: () => {},
})

export function useProgress() {
  return useContext(ProgressCtx)
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { progressService } = useServices()
  const { user } = useUser()
  const { currentSkitId } = useApp()
  const [progress, setProgressState] = useState<SkitProgress>(createEmptyProgress())

  useEffect(() => {
    if (!user || !currentSkitId) return
    progressService.getProgress(user.id, currentSkitId).then(setProgressState).catch(e => {
      console.warn('[ProgressContext] Failed to load progress:', e)
    })
  }, [user, currentSkitId, progressService])

  const setProgress = useCallback((fn: (prev: SkitProgress) => SkitProgress) => {
    setProgressState(prev => {
      const next = fn(prev)
      if (user && currentSkitId) {
        progressService.saveProgress(user.id, currentSkitId, next)
      }
      return next
    })
  }, [user, currentSkitId, progressService])

  return (
    <ProgressCtx.Provider value={{ progress, setProgress }}>
      {children}
    </ProgressCtx.Provider>
  )
}
