import { v4 as uuidv4 } from 'uuid'
import type { User } from '@/types/user'
import type { IUserService } from '@/services/types'

const STORAGE_KEY = 'skit-trainer:user'

export class LocalUserService implements IUserService {
  async getCurrentUser(): Promise<User> {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as User
    const user = await this.createUser('Performer')
    return user
  }

  async createUser(name: string): Promise<User> {
    const user: User = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString(),
      preferences: { theme: 'system' },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    return user
  }

  async updatePreferences(userId: string, prefs: Partial<User['preferences']>): Promise<void> {
    const user = await this.getCurrentUser()
    if (user.id !== userId) return
    user.preferences = { ...user.preferences, ...prefs }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }
}
