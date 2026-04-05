/**
 * Progress Tracking API client — connects to creative-hub backend.
 * Endpoints: /trainer/progress, /trainer/sessions, /trainer/stats, /trainer/streak
 */

const BASE_URL = 'http://localhost:8420'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`Progress API error: ${res.status}`)
  return res.json()
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Progress API error: ${res.status}`)
  return res.json()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Progress API error: ${res.status}`)
  return res.json()
}

// --- Types ---

export interface DailyStat {
  date: string
  session_count: number
  tools_used: number
  skits_practiced: number
  total_seconds: number
  tool_list: string
}

export interface Streak {
  current: number
  longest: number
  total_days: number
}

export interface SessionRecord {
  id: number
  user_id: string
  skit_id: string
  tool_id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  score_data: Record<string, unknown> | null
}

export interface ProgressRecord {
  user_id: string
  skit_id: string
  chunk_mastered: string[]
  recall_scores: Record<string, string>
  chain_completed: number[]
  flashcard_correct: number
  flashcard_wrong: number
  updated_at?: string
}

export interface DashboardData {
  user: { id: string; name: string; created_at: string }
  streak: Streak
  daily_stats: DailyStat[]
  all_progress: ProgressRecord[]
  recent_sessions: SessionRecord[]
}

// --- API Functions ---

export async function getProgress(userId: string, skitId: string): Promise<ProgressRecord> {
  return get<ProgressRecord>(`/trainer/progress/${userId}/${skitId}`)
}

export async function saveProgress(userId: string, skitId: string, data: Omit<ProgressRecord, 'user_id' | 'skit_id' | 'updated_at'>): Promise<void> {
  await put('/trainer/progress', { user_id: userId, skit_id: skitId, ...data })
}

export async function getAllProgress(userId: string): Promise<ProgressRecord[]> {
  return get<ProgressRecord[]>(`/trainer/progress/${userId}`)
}

export async function startSession(userId: string, skitId: string, toolId: string): Promise<number> {
  const res = await post<{ session_id: number }>('/trainer/sessions', {
    user_id: userId, skit_id: skitId, tool_id: toolId,
  })
  return res.session_id
}

export async function endSession(sessionId: number, scoreData?: Record<string, unknown>): Promise<void> {
  await put(`/trainer/sessions/${sessionId}`, { score_data: scoreData ?? null })
}

export async function getDailyStats(userId: string, days = 30): Promise<DailyStat[]> {
  return get<DailyStat[]>(`/trainer/stats/${userId}?days=${days}`)
}

export async function getStreak(userId: string): Promise<Streak> {
  return get<Streak>(`/trainer/streak/${userId}`)
}

export async function getDashboard(userId: string): Promise<DashboardData> {
  return get<DashboardData>(`/trainer/dashboard/${userId}`)
}

export async function isProgressApiAvailable(): Promise<boolean> {
  try {
    await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) })
    return true
  } catch {
    return false
  }
}
