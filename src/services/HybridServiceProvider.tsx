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
  const services = useMemo<Services>(() => {
    if (isSupabaseConfigured()) {
      return {
        skitService: new SupabaseSkitService(),
        progressService: new SupabaseProgressService(),
        userService: new SupabaseUserService(),
        starService: new SupabaseStarService(),
        goalService: new SupabaseGoalService(),
        taskService: new SupabaseTaskService(),
        isOnline: true,
      }
    }

    // Fallback: local/offline implementations
    return {
      skitService: new LocalSkitService(),
      progressService: new ApiProgressService(),
      userService: new LocalUserService(),
      starService: new LocalStarService(),
      goalService: new LocalGoalService(),
      taskService: new LocalTaskService(),
      isOnline: false,
    }
  }, [])

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  )
}
