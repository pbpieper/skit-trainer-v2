import type { IGoalService } from '@/services/types'
import type { LearningGoal } from '@/types/goals'
import { v4 as uuid } from 'uuid'

const STORAGE_KEY = 'skit-trainer:goals'

export class LocalGoalService implements IGoalService {
  private getStore(): LearningGoal[] {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  }

  private setStore(goals: LearningGoal[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
  }

  async getGoals(userId: string): Promise<LearningGoal[]> {
    return this.getStore().filter(g => g.userId === userId)
  }

  async getGoalForSkit(userId: string, skitId: string): Promise<LearningGoal | null> {
    return this.getStore().find(g => g.userId === userId && g.skitId === skitId) ?? null
  }

  async createGoal(goal: Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<LearningGoal> {
    const store = this.getStore()
    // Remove existing goal for same user+skit
    const filtered = store.filter(g => !(g.userId === goal.userId && g.skitId === goal.skitId))
    const now = new Date().toISOString()
    const newGoal: LearningGoal = { ...goal, id: uuid(), createdAt: now, updatedAt: now }
    filtered.push(newGoal)
    this.setStore(filtered)
    return newGoal
  }

  async updateGoal(goalId: string, patch: Partial<LearningGoal>): Promise<LearningGoal> {
    const store = this.getStore()
    const idx = store.findIndex(g => g.id === goalId)
    if (idx === -1) throw new Error(`Goal ${goalId} not found`)
    store[idx] = { ...store[idx], ...patch, updatedAt: new Date().toISOString() }
    this.setStore(store)
    return store[idx]
  }

  async deleteGoal(goalId: string): Promise<void> {
    const store = this.getStore()
    this.setStore(store.filter(g => g.id !== goalId))
  }
}
