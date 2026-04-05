export interface User {
  id: string
  name: string
  createdAt: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
  }
}
