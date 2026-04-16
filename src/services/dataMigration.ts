/**
 * One-time migration: localStorage → Supabase
 *
 * Reads data from localStorage (same keys the local services use),
 * pushes it to Supabase via direct client calls, and sets a flag
 * so it only runs once per device.
 */
import { supabase } from '@/services/supabase/client'
import type { Skit } from '@/types/skit'
import type { LearningGoal, DailyTask, SkitStreak } from '@/types/goals'

const MIGRATED_KEY = 'skit-trainer:migrated-to-cloud'

interface MigrationResult {
  migrated: boolean
  counts: Record<string, number>
}

// Progress store uses custom serialization with __type markers for Sets
function reviver(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && '__type' in (value as Record<string, unknown>)) {
    const obj = value as Record<string, unknown>
    if (obj.__type === 'Set') return new Set(obj.values as unknown[])
    if (obj.__type === 'Map') return new Map(obj.entries as [unknown, unknown][])
  }
  return value
}

function readJSON<T>(key: string, useReviver = false): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return useReviver ? JSON.parse(raw, reviver) : JSON.parse(raw)
  } catch {
    return null
  }
}

export async function migrateLocalToSupabase(userId: string): Promise<MigrationResult> {
  // Already migrated? Skip
  if (localStorage.getItem(MIGRATED_KEY) === 'true') {
    return { migrated: false, counts: {} }
  }

  const counts: Record<string, number> = {}

  try {
    // --- Skits ---
    const skits = readJSON<Skit[]>('skit-trainer:skits')
    if (skits && skits.length > 0) {
      // Filter out seed skits (they should already exist in the DB)
      // Only migrate user-created skits
      const userSkits = skits.filter(s => !('isSeed' in s && (s as Record<string, unknown>).isSeed))
      if (userSkits.length > 0) {
        const rows = userSkits.map(s => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle || '',
          speakers: s.speakers || [],
          chunks: s.chunks || [],
          tags: s.tags || [],
          palace_images: s.palaceImages || [],
          macro_sections: s.macroSections || [],
          created_by: userId,
          is_seed: false,
        }))

        const { error } = await supabase
          .from('skits')
          .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })

        if (!error) counts.skits = rows.length
      }
    }

    // --- Stars ---
    const starStore = readJSON<Record<string, string[]>>('skit-trainer:stars')
    if (starStore) {
      // Stars are stored as { [userId]: skitId[] }
      const allStarredIds = Object.values(starStore).flat()
      if (allStarredIds.length > 0) {
        const rows = allStarredIds.map(skitId => ({
          user_id: userId,
          skit_id: skitId,
        }))

        const { error } = await supabase
          .from('stars')
          .upsert(rows, { onConflict: 'user_id,skit_id', ignoreDuplicates: true })

        if (!error) counts.stars = rows.length
      }
    }

    // --- Goals ---
    const goals = readJSON<LearningGoal[]>('skit-trainer:goals')
    if (goals && goals.length > 0) {
      const rows = goals.map(g => ({
        id: g.id,
        user_id: userId,
        skit_id: g.skitId,
        target_date: g.targetDate,
        plan: g.plan,
        created_at: g.createdAt,
        updated_at: g.updatedAt,
      }))

      const { error } = await supabase
        .from('goals')
        .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })

      if (!error) counts.goals = rows.length
    }

    // --- Tasks ---
    const tasks = readJSON<DailyTask[]>('skit-trainer:tasks')
    if (tasks && tasks.length > 0) {
      const rows = tasks.map(t => ({
        id: t.id,
        goal_id: t.goalId,
        user_id: userId,
        skit_id: t.skitId,
        date: t.date,
        category: t.category,
        tool_id: t.toolId,
        title: t.title,
        description: t.description || '',
        difficulty: t.difficulty,
        depends_on: t.dependsOn || [],
        unlocks: t.unlocks || [],
        completed_at: t.completedAt,
        created_at: t.createdAt,
      }))

      const { error } = await supabase
        .from('tasks')
        .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })

      if (!error) counts.tasks = rows.length
    }

    // --- Streaks ---
    const streaks = readJSON<SkitStreak[]>('skit-trainer:streaks')
    if (streaks && streaks.length > 0) {
      const rows = streaks.map(s => ({
        user_id: userId,
        skit_id: s.skitId,
        current_streak: s.currentStreak,
        longest_streak: s.longestStreak,
        last_completed_date: s.lastCompletedDate,
      }))

      const { error } = await supabase
        .from('streaks')
        .upsert(rows, { onConflict: 'user_id,skit_id', ignoreDuplicates: true })

      if (!error) counts.streaks = rows.length
    }

    // --- Progress ---
    type ProgressData = {
      chunkMastered: Set<string>
      recallScores: Record<number, string>
      chainCompleted: Set<number>
      flashcardStats: { correct: number; wrong: number }
    }
    const progressStore = readJSON<Record<string, Record<string, ProgressData>>>(
      'skit-trainer:progress',
      true // use reviver for Set deserialization
    )
    if (progressStore) {
      const rows: Array<Record<string, unknown>> = []
      for (const [_uid, skitProgress] of Object.entries(progressStore)) {
        for (const [skitId, p] of Object.entries(skitProgress)) {
          rows.push({
            user_id: userId,
            skit_id: skitId,
            chunk_mastered: p.chunkMastered instanceof Set ? [...p.chunkMastered] : [],
            recall_scores: Object.fromEntries(
              Object.entries(p.recallScores).map(([k, v]) => [String(k), v])
            ),
            chain_completed: p.chainCompleted instanceof Set ? [...p.chainCompleted] : [],
            flashcard_correct: p.flashcardStats?.correct ?? 0,
            flashcard_wrong: p.flashcardStats?.wrong ?? 0,
          })
        }
      }

      if (rows.length > 0) {
        const { error } = await supabase
          .from('progress')
          .upsert(rows, { onConflict: 'user_id,skit_id', ignoreDuplicates: true })

        if (!error) counts.progress = rows.length
      }
    }

    // Mark migration as complete
    localStorage.setItem(MIGRATED_KEY, 'true')
    return { migrated: true, counts }
  } catch (err) {
    console.error('[dataMigration] Error during migration:', err)
    // Don't set the flag — allow retry on next login
    return { migrated: false, counts }
  }
}
