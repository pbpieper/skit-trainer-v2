import type { IStarService } from '@/services/types'
import { supabase } from '@/services/supabase/client'
import { writeQueue } from '@/services/supabase/writeQueue'

export class SupabaseStarService implements IStarService {
  async getStarred(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('stars')
      .select('skit_id')
      .eq('user_id', userId)

    if (error) throw error
    return (data ?? []).map((row: { skit_id: string }) => row.skit_id)
  }

  async star(userId: string, skitId: string): Promise<void> {
    writeQueue.enqueue({
      table: 'stars',
      operation: 'upsert',
      data: { user_id: userId, skit_id: skitId },
      match: { user_id: userId, skit_id: skitId },
    })
  }

  async unstar(userId: string, skitId: string): Promise<void> {
    writeQueue.enqueue({
      table: 'stars',
      operation: 'delete',
      data: {},
      match: { user_id: userId, skit_id: skitId },
    })
  }

  async isStarred(userId: string, skitId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('stars')
      .select('id')
      .eq('user_id', userId)
      .eq('skit_id', skitId)
      .maybeSingle()

    if (error) throw error
    return data !== null
  }
}
