import type { IStarService } from '@/services/types'

const STORAGE_KEY = 'skit-trainer:stars'

export class LocalStarService implements IStarService {
  private getStore(): Record<string, string[]> {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  }

  private setStore(store: Record<string, string[]>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }

  async getStarred(userId: string): Promise<string[]> {
    return this.getStore()[userId] ?? []
  }

  async star(userId: string, skitId: string): Promise<void> {
    const store = this.getStore()
    const list = store[userId] ?? []
    if (!list.includes(skitId)) {
      list.push(skitId)
      store[userId] = list
      this.setStore(store)
    }
  }

  async unstar(userId: string, skitId: string): Promise<void> {
    const store = this.getStore()
    const list = store[userId] ?? []
    store[userId] = list.filter(id => id !== skitId)
    this.setStore(store)
  }

  async isStarred(userId: string, skitId: string): Promise<boolean> {
    const list = await this.getStarred(userId)
    return list.includes(skitId)
  }
}
