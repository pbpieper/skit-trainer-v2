import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type {
  ISkitService,
  IProgressService,
  IUserService,
  IStarService,
  IGoalService,
  ITaskService,
} from '@/services/types'

// Local implementations
import { LocalSkitService } from '@/services/local/LocalSkitService'
import { ApiProgressService } from '@/services/ApiProgressService'
import { LocalUserService } from '@/services/local/LocalUserService'
import { LocalStarService } from '@/services/local/LocalStarService'
import { LocalGoalService } from '@/services/local/LocalGoalService'
import { LocalTaskService } from '@/services/local/LocalTaskService'

// Supabase implementations
import { SupabaseSkitService } from '@/services/supabase/SupabaseSkitService'
import { SupabaseProgressService } from '@/services/supabase/SupabaseProgressService'
import { SupabaseUserService } from '@/services/supabase/SupabaseUserService'
import { SupabaseStarService } from '@/services/supabase/SupabaseStarService'
import { SupabaseGoalService } from '@/services/supabase/SupabaseGoalService'
import { SupabaseTaskService } from '@/services/supabase/SupabaseTaskService'

export interface Services {
  skitService: ISkitService
  progressService: IProgressService
  userService: IUserService
  starService: IStarService
  goalService: IGoalService
  taskService: ITaskService
  isOnline: boolean
}

const ServiceContext = createContext<Services | null>(null)

export function useServices(): Services {
  const ctx = useContext(ServiceContext)
  if (!ctx) throw new Error('useServices must be used within ServiceProvider')
  return ctx
}

/** Returns true when Supabase env vars are configured */
function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  return typeof url === 'string' && url.trim().length > 0
}

export function ServiceProvider({ children }: { children: ReactNode }) {
  // Local-first: use localStorage services for all user data.
  // Supabase is available for shared/public features (UpdateBanner, patch notes)
  // and will be wired for user data once auth UI is added.
  // When auth is ready, swap to Supabase services for authenticated users.
  const services = useMemo<Services>(() => ({
    skitService: new LocalSkitService(),
    progressService: new ApiProgressService(),
    userService: new LocalUserService(),
    starService: new LocalStarService(),
    goalService: new LocalGoalService(),
    taskService: new LocalTaskService(),
    isOnline: isSupabaseConfigured(),
  }), [])

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  )
}
