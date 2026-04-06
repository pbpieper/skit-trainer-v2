import { v4 as uuidv4 } from 'uuid'
import type { Skit } from '@/types/skit'
import type { ISkitService } from '@/services/types'
import { SEED_SKITS } from '@/data/skits'

const STORAGE_KEY = 'skit-trainer:skits'

export class LocalSkitService implements ISkitService {
  private getAll(): Skit[] {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      this.saveAll(SEED_SKITS)
      return SEED_SKITS
    }
    // Migrate: ensure all skits have tags array
    const skits = JSON.parse(raw) as Skit[]
    return skits.map(s => ({ ...s, tags: s.tags ?? [] }))
  }

  private saveAll(skits: Skit[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(skits))
  }

  async listSkits(): Promise<Skit[]> {
    return this.getAll()
  }

  async getSkit(id: string): Promise<Skit | null> {
    return this.getAll().find(s => s.id === id) ?? null
  }

  async createSkit(input: Omit<Skit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Skit> {
    const now = new Date().toISOString()
    const skit: Skit = { ...input, id: uuidv4(), createdAt: now, updatedAt: now }
    const all = this.getAll()
    all.push(skit)
    this.saveAll(all)
    return skit
  }

  async updateSkit(id: string, patch: Partial<Skit>): Promise<Skit> {
    const all = this.getAll()
    const idx = all.findIndex(s => s.id === id)
    if (idx === -1) throw new Error(`Skit not found: ${id}`)
    all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
    this.saveAll(all)
    return all[idx]
  }

  async deleteSkit(id: string): Promise<void> {
    const all = this.getAll().filter(s => s.id !== id)
    this.saveAll(all)
  }
}
