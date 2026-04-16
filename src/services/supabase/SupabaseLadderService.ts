import type { LadderProgress, ChallengeAttempt, LadderLevelId } from '@/types/ladder'
import type { ILadderService } from '@/services/types'
import { createEmptyLadderProgress } from '@/types/ladder'
import { supabase } from '@/services/supabase/client'
import { writeQueue } from '@/services/supabase/writeQueue'

/** Shape of a row in the `ladder_progress` table */
interface LadderProgressRow {
  id: string
  user_id: string
  skit_id: string
  current_level: number
  unlocked_levels: number[]
  completed_levels: number[]
  level_scores: Record<string, number>
  tasks_completed: Record<string, number>
  updated_at: string
}

/** Shape of a row in the `challenge_attempts` table */
interface ChallengeAttemptRow {
  id: string
  user_id: string
  skit_id: string
  level_id: number
  challenge_type: string
  score: number
  passed: boolean
  attempted_at: string
}

function rowToProgress(row: LadderProgressRow): LadderProgress {
  return {
    userId: row.user_id,
    skitId: row.skit_id,
    currentLevel: row.current_level as LadderLevelId,
    unlockedLevels: row.unlocked_levels as LadderLevelId[],
    completedLevels: row.completed_levels as LadderLevelId[],
    levelScores: row.level_scores,
    tasksCompleted: row.tasks_completed,
    updatedAt: row.updated_at,
  }
}

function progressToRow(
  progress: LadderProgress
): Record<string, unknown> {
  return {
    user_id: progress.userId,
    skit_id: progress.skitId,
    current_level: progress.currentLevel,
    unlocked_levels: progress.unlockedLevels,
    completed_levels: progress.completedLevels,
    level_scores: progress.levelScores,
    tasks_completed: progress.tasksCompleted,
  }
}

function rowToAttempt(row: ChallengeAttemptRow): ChallengeAttempt {
  return {
    id: row.id,
    userId: row.user_id,
    skitId: row.skit_id,
    levelId: row.level_id as LadderLevelId,
    challengeType: row.challenge_type as any,
    score: row.score,
    passed: row.passed,
    attemptedAt: row.attempted_at,
  }
}

function attemptToRow(attempt: Omit<ChallengeAttempt, 'id'>): Record<string, unknown> {
  return {
    user_id: attempt.userId,
    skit_id: attempt.skitId,
    level_id: attempt.levelId,
    challenge_type: attempt.challengeType,
    score: attempt.score,
    passed: attempt.passed,
  }
}

export class SupabaseLadderService implements ILadderService {
  async getLadderProgress(userId: string, skitId: string): Promise<LadderProgress> {
    const { data, error } = await supabase
      .from('ladder_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('skit_id', skitId)
      .maybeSingle()

    if (error) throw error

    // If no progress exists, create fresh one
    if (!data) {
      const fresh = createEmptyLadderProgress(userId, skitId)
      await this.saveLadderProgress(userId, skitId, fresh)
      return fresh
    }

    return rowToProgress(data as LadderProgressRow)
  }

  async saveLadderProgress(
    userId: string,
    skitId: string,
    progress: LadderProgress
  ): Promise<void> {
    const row = progressToRow(progress)

    const { error } = await supabase
      .from('ladder_progress')
      .upsert(
        {
          user_id: userId,
          skit_id: skitId,
          ...row,
        },
        { onConflict: 'user_id,skit_id' }
      )

    if (error) {
      writeQueue.enqueue({
        table: 'ladder_progress',
        operation: 'upsert',
        data: {
          user_id: userId,
          skit_id: skitId,
          ...row,
        },
        match: { user_id: userId, skit_id: skitId },
      })
    }
  }

  async recordChallengeAttempt(
    attempt: Omit<ChallengeAttempt, 'id'>
  ): Promise<ChallengeAttempt> {
    const row = attemptToRow(attempt)

    const { data, error } = await supabase
      .from('challenge_attempts')
      .insert(row)
      .select('*')
      .single()

    if (error) {
      writeQueue.enqueue({
        table: 'challenge_attempts',
        operation: 'insert',
        data: row,
        match: {},
      })
      // Return synthetic result with generated ID
      return {
        ...attempt,
        id: `pending-${Date.now()}`,
      }
    }

    return rowToAttempt(data as ChallengeAttemptRow)
  }

  async getChallengeHistory(userId: string, skitId: string): Promise<ChallengeAttempt[]> {
    const { data, error } = await supabase
      .from('challenge_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('skit_id', skitId)
      .order('attempted_at', { ascending: false })

    if (error) throw error
    return (data as ChallengeAttemptRow[]).map(rowToAttempt)
  }
}
