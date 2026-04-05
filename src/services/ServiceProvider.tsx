import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { ISkitService, IProgressService, IUserService } from '@/services/types'
import { LocalSkitService } from '@/services/local/LocalSkitService'
import { ApiProgressService } from '@/services/ApiProgressService'
import { LocalUserService } from '@/services/local/LocalUserService'

export interface Services {
  skitService: ISkitService
  progressService: IProgressService
  userService: IUserService
}

const ServiceContext = createContext<Services | null>(null)

export function useServices(): Services {
  const ctx = useContext(ServiceContext)
  if (!ctx) throw new Error('useServices must be used within ServiceProvider')
  return ctx
}

export function ServiceProvider({ children }: { children: ReactNode }) {
  const services = useMemo<Services>(() => ({
    skitService: new LocalSkitService(),
    progressService: new ApiProgressService(),
    userService: new LocalUserService(),
  }), [])

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  )
}
