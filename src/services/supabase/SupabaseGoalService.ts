import type { LearningGoal, DifficultyPlan } from '@/types/goals'
import type { IGoalService } from '@/services/types'
import { supabase } from '@/services/supabase/client'
import { writeQueue } from '@/services/supabase/writeQueue'

/** Shape of a row in the `goals` table */
interface GoalRow {
  id: string
  user_id: string
  skit_id: string
  target_date: string
  plan: DifficultyPlan
  created_at: string
  updated_at: string
}

function rowToGoal(row: GoalRow): LearningGoal {
  return {
    id: row.id,
    userId: row.user_id,
    skitId: row.skit_id,
    targetDate: row.target_date,
    plan: row.plan,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function goalToRow(
  goal: Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt'>
): Record<string, unknown> {
  return {
    user_id: goal.userId,
    skit_id: goal.skitId,
    target_date: goal.targetDate,
    plan: goal.plan,
  }
}

function patchToRow(patch: Partial<LearningGoal>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (patch.userId !== undefined) row.user_id = patch.userId
  if (patch.skitId !== undefined) row.skit_id = patch.skitId
  if (patch.targetDate !== undefined) row.target_date = patch.targetDate
  if (patch.plan !== undefined) row.plan = patch.plan
  return row
}

export class SupabaseGoalService implements IGoalService {
  async getGoals(userId: string): Promise<LearningGoal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as GoalRow[]).map(rowToGoal)
  }

  async getGoalForSkit(
    userId: string,
    skitId: string
  ): Promise<LearningGoal | null> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('skit_id', skitId)
      .maybeSingle()

    if (error) throw error
    return data ? rowToGoal(data as GoalRow) : null
  }

  async createGoal(
    goal: Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<LearningGoal> {
    const row = goalToRow(goal)

    const { data, error } = await supabase
      .from('goals')
      .insert(row)
      .select('*')
      .single()

    if (error) throw error
    return rowToGoal(data as GoalRow)
  }

  async updateGoal(
    goalId: string,
    patch: Partial<LearningGoal>
  ): Promise<LearningGoal> {
    const row = patchToRow(patch)

    const { data, error } = await supabase
      .from('goals')
      .update(row)
      .eq('id', goalId)
      .select('*')
      .single()

    if (error) {
      writeQueue.enqueue({
        table: 'goals',
        operation: 'update',
        data: row,
        match: { id: goalId },
      })
      throw error
    }

    return rowToGoal(data as GoalRow)
  }

  async deleteGoal(goalId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (error) {
      writeQueue.enqueue({
        table: 'goals',
        operation: 'delete',
        data: {},
        match: { id: goalId },
      })
    }
  }
}
