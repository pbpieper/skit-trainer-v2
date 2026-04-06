import type { Skit } from '@/types/skit'
import type { SkitProgress, ProgressExport } from '@/types/progress'
import type { User } from '@/types/user'
import type { LearningGoal, DailyTask, SkitStreak } from '@/types/goals'

export interface ISkitService {
  listSkits(): Promise<Skit[]>
  getSkit(id: string): Promise<Skit | null>
  createSkit(skit: Omit<Skit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Skit>
  updateSkit(id: string, patch: Partial<Skit>): Promise<Skit>
  deleteSkit(id: string): Promise<void>
}

export interface IProgressService {
  getProgress(userId: string, skitId: string): Promise<SkitProgress>
  saveProgress(userId: string, skitId: string, progress: SkitProgress): Promise<void>
  exportProgress(userId: string): Promise<ProgressExport>
}

export interface IUserService {
  getCurrentUser(): Promise<User>
  createUser(name: string): Promise<User>
  updatePreferences(userId: string, prefs: Partial<User['preferences']>): Promise<void>
}

export interface IStarService {
  getStarred(userId: string): Promise<string[]>
  star(userId: string, skitId: string): Promise<void>
  unstar(userId: string, skitId: string): Promise<void>
  isStarred(userId: string, skitId: string): Promise<boolean>
}

export interface IGoalService {
  getGoals(userId: string): Promise<LearningGoal[]>
  getGoalForSkit(userId: string, skitId: string): Promise<LearningGoal | null>
  createGoal(goal: Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<LearningGoal>
  updateGoal(goalId: string, patch: Partial<LearningGoal>): Promise<LearningGoal>
  deleteGoal(goalId: string): Promise<void>
}

export interface ITaskService {
  getTasksForDate(userId: string, date: string): Promise<DailyTask[]>
  getTasksForSkit(userId: string, skitId: string, date: string): Promise<DailyTask[]>
  completeTask(taskId: string): Promise<DailyTask>
  uncompleteTask(taskId: string): Promise<DailyTask>
  saveTasks(tasks: DailyTask[]): Promise<void>
  getStreak(userId: string, skitId: string): Promise<SkitStreak>
  updateStreak(userId: string, skitId: string): Promise<SkitStreak>
}
