import type { SkitProgress, ProgressExport } from '@/types/progress'
import { createEmptyProgress } from '@/types/progress'
import type { IProgressService } from '@/services/types'
import { supabase } from '@/services/supabase/client'
import { writeQueue } from '@/services/supabase/writeQueue'

/** Shape of a row in the `progress` table */
interface ProgressRow {
  id: string
  user_id: string
  skit_id: string
  chunk_mastered: string[]
  recall_scores: Record<string, string>
  chain_completed: number[]
  flashcard_correct: number
  flashcard_wrong: number
  updated_at: string
}

function rowToProgress(row: ProgressRow): SkitProgress {
  return {
    chunkMastered: new Set(row.chunk_mastered ?? []),
    recallScores: deserializeRecallScores(row.recall_scores ?? {}),
    chainCompleted: new Set(row.chain_completed ?? []),
    flashcardStats: {
      correct: row.flashcard_correct ?? 0,
      wrong: row.flashcard_wrong ?? 0,
    },
  }
}

function progressToRow(
  userId: string,
  skitId: string,
  progress: SkitProgress
): Record<string, unknown> {
  return {
    user_id: userId,
    skit_id: skitId,
    chunk_mastered: Array.from(progress.chunkMastered),
    recall_scores: serializeRecallScores(progress.recallScores),
    chain_completed: Array.from(progress.chainCompleted),
    flashcard_correct: progress.flashcardStats.correct,
    flashcard_wrong: progress.flashcardStats.wrong,
  }
}

/**
 * recallScores in TypeScript is Record<number, string>.
 * JSONB in Postgres stores keys as strings, so we serialize number keys.
 */
function serializeRecallScores(
  scores: Record<number, string>
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(scores)) {
    result[String(key)] = value
  }
  return result
}

function deserializeRecallScores(
  raw: Record<string, string>
): Record<number, string> {
  const result: Record<number, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    result[Number(key)] = value
  }
  return result
}

export class SupabaseProgressService implements IProgressService {
  async getProgress(userId: string, skitId: string): Promise<SkitProgress> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('skit_id', skitId)
      .maybeSingle()

    if (error) throw error
    if (!data) return createEmptyProgress()
    return rowToProgress(data as ProgressRow)
  }

  async saveProgress(
    userId: string,
    skitId: string,
    progress: SkitProgress
  ): Promise<void> {
    const row = progressToRow(userId, skitId, progress)

    writeQueue.enqueue({
      table: 'progress',
      operation: 'upsert',
      data: row,
      match: { user_id: userId, skit_id: skitId },
    })
  }

  async exportProgress(userId: string): Promise<ProgressExport> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error

    const progressMap: ProgressExport['progress'] = {}
    for (const row of (data as ProgressRow[]) ?? []) {
      progressMap[row.skit_id] = {
        chunkMastered: row.chunk_mastered ?? [],
        recallScores: deserializeRecallScores(row.recall_scores ?? {}),
        chainCompleted: row.chain_completed ?? [],
        flashcardStats: {
          correct: row.flashcard_correct ?? 0,
          wrong: row.flashcard_wrong ?? 0,
        },
      }
    }

    return {
      userId,
      exportedAt: new Date().toISOString(),
      progress: progressMap,
    }
  }
}
