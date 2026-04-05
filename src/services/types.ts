import type { Skit } from '@/types/skit'
import type { SkitProgress, ProgressExport } from '@/types/progress'
import type { User } from '@/types/user'

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
