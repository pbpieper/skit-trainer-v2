import type { DailyTask, SkitStreak, PlanCategory } from '@/types/goals'
import type { ToolId } from '@/types/tools'
import type { ITaskService } from '@/services/types'
import { supabase } from '@/services/supabase/client'
import { writeQueue } from '@/services/supabase/writeQueue'

/** Shape of a row in the `tasks` table */
interface TaskRow {
  id: string
  goal_id: string
  user_id: string
  skit_id: string
  date: string
  category: PlanCategory['name']
  tool_id: string
  title: string
  description: string
  difficulty: number
  depends_on: string[]
  unlocks: string[]
  completed_at: string | null
  created_at: string
}

/** Shape of a row in the `streaks` table */
interface StreakRow {
  id: string
  user_id: string
  skit_id: string
  current_streak: number
  longest_streak: number
  last_completed_date: string | null
}

function rowToTask(row: TaskRow): DailyTask {
  return {
    id: row.id,
    goalId: row.goal_id,
    userId: row.user_id,
    skitId: row.skit_id,
    date: row.date,
    category: row.category,
    toolId: row.tool_id as ToolId,
    title: row.title,
    description: row.description,
    difficulty: row.difficulty,
    dependsOn: row.depends_on ?? [],
    unlocks: row.unlocks ?? [],
    completedAt: row.completed_at,
    createdAt: row.created_at,
  }
}

function taskToRow(task: DailyTask): Record<string, unknown> {
  return {
    id: task.id,
    goal_id: task.goalId,
    user_id: task.userId,
    skit_id: task.skitId,
    date: task.date,
    category: task.category,
    tool_id: task.toolId,
    title: task.title,
    description: task.description,
    difficulty: task.difficulty,
    depends_on: task.dependsOn,
    unlocks: task.unlocks,
    completed_at: task.completedAt,
  }
}

function rowToStreak(row: StreakRow): SkitStreak {
  return {
    skitId: row.skit_id,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastCompletedDate: row.last_completed_date,
  }
}

export class SupabaseTaskService implements ITaskService {
  async getTasksForDate(userId: string, date: string): Promise<DailyTask[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data as TaskRow[]).map(rowToTask)
  }

  async getTasksForSkit(
    userId: string,
    skitId: string,
    date: string
  ): Promise<DailyTask[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('skit_id', skitId)
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data as TaskRow[]).map(rowToTask)
  }

  async completeTask(taskId: string): Promise<DailyTask> {
    const completedAt = new Date().toISOString()

    const { data, error } = await supabase
      .from('tasks')
      .update({ completed_at: completedAt })
      .eq('id', taskId)
      .select('*')
      .single()

    if (error) {
      writeQueue.enqueue({
        table: 'tasks',
        operation: 'update',
        data: { completed_at: completedAt },
        match: { id: taskId },
      })
      throw error
    }

    return rowToTask(data as TaskRow)
  }

  async uncompleteTask(taskId: string): Promise<DailyTask> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed_at: null })
      .eq('id', taskId)
      .select('*')
      .single()

    if (error) {
      writeQueue.enqueue({
        table: 'tasks',
        operation: 'update',
        data: { completed_at: null },
        match: { id: taskId },
      })
      throw error
    }

    return rowToTask(data as TaskRow)
  }

  async saveTasks(tasks: DailyTask[]): Promise<void> {
    if (tasks.length === 0) return

    const rows = tasks.map(taskToRow)

    // Use writeQueue for batch upsert — tasks have server-generated UUIDs
    // but we pass them in, so upsert on `id` works.
    for (const row of rows) {
      writeQueue.enqueue({
        table: 'tasks',
        operation: 'upsert',
        data: row,
      })
    }
  }

  async getStreak(userId: string, skitId: string): Promise<SkitStreak> {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('skit_id', skitId)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return {
        skitId,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
      }
    }

    return rowToStreak(data as StreakRow)
  }

  async updateStreak(userId: string, skitId: string): Promise<SkitStreak> {
    const today = new Date().toISOString().slice(0, 10)
    const existing = await this.getStreak(userId, skitId)

    let currentStreak: number
    let longestStreak: number

    if (existing.lastCompletedDate === today) {
      // Already counted today
      return existing
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    if (existing.lastCompletedDate === yesterdayStr) {
      currentStreak = existing.currentStreak + 1
    } else {
      currentStreak = 1
    }
    longestStreak = Math.max(existing.longestStreak, currentStreak)

    const row = {
      user_id: userId,
      skit_id: skitId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_completed_date: today,
    }

    writeQueue.enqueue({
      table: 'streaks',
      operation: 'upsert',
      data: row,
      match: { user_id: userId, skit_id: skitId },
    })

    return {
      skitId,
      currentStreak,
      longestStreak,
      lastCompletedDate: today,
    }
  }
}
