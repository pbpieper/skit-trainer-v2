import type { ToolId } from './tools'

export interface LearningGoal {
  id: string
  userId: string
  skitId: string
  targetDate: string // ISO date (YYYY-MM-DD)
  plan: DifficultyPlan
  createdAt: string
  updatedAt: string
}

export interface DifficultyPlan {
  categories: PlanCategory[]
  totalDays: number
}

export interface PlanCategory {
  name: 'foundation' | 'retrieval' | 'integration' | 'transfer'
  label: string
  description: string
  tools: ToolId[]
}

export interface DailyTask {
  id: string
  goalId: string
  userId: string
  skitId: string
  date: string // ISO date (YYYY-MM-DD)
  category: PlanCategory['name']
  toolId: ToolId
  title: string
  description: string
  difficulty: number // 1-5
  dependsOn: string[] // task IDs
  unlocks: string[] // task IDs
  completedAt: string | null
  createdAt: string
}

export interface SkitStreak {
  skitId: string
  currentStreak: number
  longestStreak: number
  lastCompletedDate: string | null
}
