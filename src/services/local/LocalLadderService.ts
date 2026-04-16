import type { ILadderService } from '@/services/types'
import type { LadderProgress, ChallengeAttempt } from '@/types/ladder'
import { createEmptyLadderProgress } from '@/types/ladder'
import { v4 as uuid } from 'uuid'

const PROGRESS_KEY = 'skit-trainer:ladder-progress'
const ATTEMPTS_KEY = 'skit-trainer:challenge-attempts'

export class LocalLadderService implements ILadderService {
  private getProgressStore(): LadderProgress[] {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : []
  }

  private setProgressStore(progress: LadderProgress[]) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  }

  private getAttemptsStore(): ChallengeAttempt[] {
    const raw = localStorage.getItem(ATTEMPTS_KEY)
    return raw ? JSON.parse(raw) : []
  }

  private setAttemptsStore(attempts: ChallengeAttempt[]) {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts))
  }

  async getLadderProgress(userId: string, skitId: string): Promise<LadderProgress> {
    const store = this.getProgressStore()
    const existing = store.find(p => p.userId === userId && p.skitId === skitId)
    if (existing) return existing

    // Create fresh progress for new user/skit
    const fresh = createEmptyLadderProgress(userId, skitId)
    store.push(fresh)
    this.setProgressStore(store)
    return fresh
  }

  async saveLadderProgress(
    userId: string,
    skitId: string,
    progress: LadderProgress
  ): Promise<void> {
    const store = this.getProgressStore()
    const idx = store.findIndex(p => p.userId === userId && p.skitId === skitId)
    if (idx === -1) {
      store.push(progress)
    } else {
      store[idx] = progress
    }
    this.setProgressStore(store)
  }

  async recordChallengeAttempt(
    attempt: Omit<ChallengeAttempt, 'id'>
  ): Promise<ChallengeAttempt> {
    const store = this.getAttemptsStore()
    const full: ChallengeAttempt = {
      ...attempt,
      id: uuid(),
    }
    store.push(full)
    this.setAttemptsStore(store)
    return full
  }

  async getChallengeHistory(userId: string, skitId: string): Promise<ChallengeAttempt[]> {
    const store = this.getAttemptsStore()
    return store.filter(a => a.userId === userId && a.skitId === skitId)
  }
}
