import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useServices } from '@/services/ServiceProvider'
import { useUser } from '@/context/UserContext'

interface StarContextValue {
  starred: Set<string>
  toggleStar: (skitId: string) => Promise<void>
  isStarred: (skitId: string) => boolean
}

const StarCtx = createContext<StarContextValue>({
  starred: new Set(),
  toggleStar: async () => {},
  isStarred: () => false,
})

export function useStar() {
  return useContext(StarCtx)
}

export function StarProvider({ children }: { children: ReactNode }) {
  const { starService } = useServices()
  const { user } = useUser()
  const [starred, setStarred] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    starService.getStarred(user.id).then(ids => setStarred(new Set(ids))).catch(e => {
      console.warn('[StarContext] Failed to load stars:', e)
    })
  }, [user, starService])

  const toggleStar = useCallback(async (skitId: string) => {
    if (!user) return
    if (starred.has(skitId)) {
      await starService.unstar(user.id, skitId)
      setStarred(prev => {
        const next = new Set(prev)
        next.delete(skitId)
        return next
      })
    } else {
      await starService.star(user.id, skitId)
      setStarred(prev => {
        const next = new Set(prev)
        next.add(skitId)
        return next
      })
    }
  }, [user, starred, starService])

  const isStarred = useCallback((skitId: string) => starred.has(skitId), [starred])

  return (
    <StarCtx.Provider value={{ starred, toggleStar, isStarred }}>
      {children}
    </StarCtx.Provider>
  )
}
