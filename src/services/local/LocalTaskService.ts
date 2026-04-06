import type { ITaskService } from '@/services/types'
import type { DailyTask, SkitStreak } from '@/types/goals'

const TASKS_KEY = 'skit-trainer:tasks'
const STREAKS_KEY = 'skit-trainer:streaks'

export class LocalTaskService implements ITaskService {
  private getTasks(): DailyTask[] {
    const raw = localStorage.getItem(TASKS_KEY)
    return raw ? JSON.parse(raw) : []
  }

  private setTasks(tasks: DailyTask[]) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  }

  private getStreaks(): SkitStreak[] {
    const raw = localStorage.getItem(STREAKS_KEY)
    return raw ? JSON.parse(raw) : []
  }

  private setStreaks(streaks: SkitStreak[]) {
    localStorage.setItem(STREAKS_KEY, JSON.stringify(streaks))
  }

  async getTasksForDate(userId: string, date: string): Promise<DailyTask[]> {
    return this.getTasks().filter(t => t.userId === userId && t.date === date)
  }

  async getTasksForSkit(userId: string, skitId: string, date: string): Promise<DailyTask[]> {
    return this.getTasks().filter(t => t.userId === userId && t.skitId === skitId && t.date === date)
  }

  async completeTask(taskId: string): Promise<DailyTask> {
    const tasks = this.getTasks()
    const idx = tasks.findIndex(t => t.id === taskId)
    if (idx === -1) throw new Error(`Task ${taskId} not found`)
    tasks[idx] = { ...tasks[idx], completedAt: new Date().toISOString() }
    this.setTasks(tasks)
    return tasks[idx]
  }

  async uncompleteTask(taskId: string): Promise<DailyTask> {
    const tasks = this.getTasks()
    const idx = tasks.findIndex(t => t.id === taskId)
    if (idx === -1) throw new Error(`Task ${taskId} not found`)
    tasks[idx] = { ...tasks[idx], completedAt: null }
    this.setTasks(tasks)
    return tasks[idx]
  }

  async saveTasks(newTasks: DailyTask[]): Promise<void> {
    const tasks = this.getTasks()
    // Upsert: replace existing by id, add new
    const taskMap = new Map(tasks.map(t => [t.id, t]))
    for (const t of newTasks) {
      taskMap.set(t.id, t)
    }
    this.setTasks(Array.from(taskMap.values()))
  }

  async getStreak(userId: string, skitId: string): Promise<SkitStreak> {
    const streaks = this.getStreaks()
    return streaks.find(s => s.skitId === skitId) ?? {
      skitId,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
    }
  }

  async updateStreak(userId: string, skitId: string): Promise<SkitStreak> {
    const streaks = this.getStreaks()
    const today = new Date().toISOString().slice(0, 10)
    let streak = streaks.find(s => s.skitId === skitId)

    if (!streak) {
      streak = { skitId, currentStreak: 1, longestStreak: 1, lastCompletedDate: today }
      streaks.push(streak)
    } else if (streak.lastCompletedDate === today) {
      // Already counted today
    } else {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10)

      if (streak.lastCompletedDate === yesterdayStr) {
        streak.currentStreak += 1
      } else {
        streak.currentStreak = 1
      }
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak)
      streak.lastCompletedDate = today
    }

    this.setStreaks(streaks)
    return streak
  }
}
