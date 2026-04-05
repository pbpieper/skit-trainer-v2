import { useEffect, useRef } from 'react'
import { useUser } from '@/context/UserContext'
import { useApp } from '@/context/AppContext'
import * as api from '@/services/progressApi'

/**
 * Tracks tool usage sessions automatically.
 * Starts a session when the active tool changes, ends it when switching away.
 */
export function useSessionTracker() {
  const { user } = useUser()
  const { activeTool, currentSkitId } = useApp()
  const sessionRef = useRef<number | null>(null)
  const availableRef = useRef<boolean | null>(null)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const start = async () => {
      if (availableRef.current === null) {
        availableRef.current = await api.isProgressApiAvailable()
      }
      if (!availableRef.current || cancelled) return

      // End previous session
      if (sessionRef.current !== null) {
        try { await api.endSession(sessionRef.current) } catch { /* ignore */ }
        sessionRef.current = null
      }

      // Start new session
      try {
        const id = await api.startSession(user.id, currentSkitId, activeTool)
        if (!cancelled) sessionRef.current = id
      } catch { /* ignore — backend may be down */ }
    }

    start()

    return () => {
      cancelled = true
      if (sessionRef.current !== null) {
        api.endSession(sessionRef.current).catch(() => {})
        sessionRef.current = null
      }
    }
  }, [user, activeTool, currentSkitId])
}
