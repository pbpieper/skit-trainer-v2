/**
 * API-backed progress service — stores progress in creative-hub SQLite.
 * Falls back to LocalProgressService when the backend is unavailable.
 */

import type { SkitProgress, ProgressExport } from '@/types/progress'
import { createEmptyProgress } from '@/types/progress'
import type { IProgressService } from '@/services/types'
import * as api from '@/services/progressApi'
import { LocalProgressService } from '@/services/local/LocalProgressService'

export class ApiProgressService implements IProgressService {
  private fallback = new LocalProgressService()
  private _available: boolean | null = null

  private async isAvailable(): Promise<boolean> {
    if (this._available !== null) return this._available
    this._available = await api.isProgressApiAvailable()
    return this._available
  }

  async getProgress(userId: string, skitId: string): Promise<SkitProgress> {
    if (!(await this.isAvailable())) return this.fallback.getProgress(userId, skitId)
    try {
      const data = await api.getProgress(userId, skitId)
      return {
        chunkMastered: new Set(data.chunk_mastered || []),
        recallScores: (data.recall_scores || {}) as Record<number, string>,
        chainCompleted: new Set(data.chain_completed || []),
        flashcardStats: {
          correct: data.flashcard_correct || 0,
          wrong: data.flashcard_wrong || 0,
        },
      }
    } catch {
      return this.fallback.getProgress(userId, skitId)
    }
  }

  async saveProgress(userId: string, skitId: string, progress: SkitProgress): Promise<void> {
    // Always save locally as cache
    this.fallback.saveProgress(userId, skitId, progress)

    if (!(await this.isAvailable())) return
    try {
      await api.saveProgress(userId, skitId, {
        chunk_mastered: [...progress.chunkMastered],
        recall_scores: progress.recallScores as Record<string, string>,
        chain_completed: [...progress.chainCompleted],
        flashcard_correct: progress.flashcardStats.correct,
        flashcard_wrong: progress.flashcardStats.wrong,
      })
    } catch {
      // Saved locally, will sync later
    }
  }

  async exportProgress(userId: string): Promise<ProgressExport> {
    if (!(await this.isAvailable())) return this.fallback.exportProgress(userId)
    try {
      const allProgress = await api.getAllProgress(userId)
      const progress: ProgressExport['progress'] = {}
      for (const p of allProgress) {
        progress[p.skit_id] = {
          chunkMastered: p.chunk_mastered,
          recallScores: p.recall_scores as Record<number, string>,
          chainCompleted: p.chain_completed,
          flashcardStats: { correct: p.flashcard_correct, wrong: p.flashcard_wrong },
        }
      }
      return { userId, exportedAt: new Date().toISOString(), progress }
    } catch {
      return this.fallback.exportProgress(userId)
    }
  }
}
