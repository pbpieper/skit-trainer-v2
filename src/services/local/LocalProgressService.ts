import type { SkitProgress, ProgressExport } from '@/types/progress'
import type { IProgressService } from '@/services/types'
import { createEmptyProgress } from '@/types/progress'

const STORAGE_KEY = 'skit-trainer:progress'

function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Set) return { __type: 'Set', values: [...value] }
  if (value instanceof Map) return { __type: 'Map', entries: [...value] }
  return value
}

function reviver(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && '__type' in (value as Record<string, unknown>)) {
    const obj = value as Record<string, unknown>
    if (obj.__type === 'Set') return new Set(obj.values as unknown[])
    if (obj.__type === 'Map') return new Map(obj.entries as [unknown, unknown][])
  }
  return value
}

type ProgressStore = Record<string, Record<string, SkitProgress>>

export class LocalProgressService implements IProgressService {
  private getStore(): ProgressStore {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw, reviver) as ProgressStore
  }

  private saveStore(store: ProgressStore): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store, replacer))
  }

  async getProgress(userId: string, skitId: string): Promise<SkitProgress> {
    const store = this.getStore()
    return store[userId]?.[skitId] ?? createEmptyProgress()
  }

  async saveProgress(userId: string, skitId: string, progress: SkitProgress): Promise<void> {
    const store = this.getStore()
    if (!store[userId]) store[userId] = {}
    store[userId][skitId] = progress
    this.saveStore(store)
  }

  async exportProgress(userId: string): Promise<ProgressExport> {
    const store = this.getStore()
    const userProgress = store[userId] ?? {}
    const progress: ProgressExport['progress'] = {}
    for (const [skitId, p] of Object.entries(userProgress)) {
      progress[skitId] = {
        chunkMastered: [...p.chunkMastered],
        recallScores: p.recallScores,
        chainCompleted: [...p.chainCompleted],
        flashcardStats: p.flashcardStats,
      }
    }
    return { userId, exportedAt: new Date().toISOString(), progress }
  }
}
