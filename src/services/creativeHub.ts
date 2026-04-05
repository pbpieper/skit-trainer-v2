/**
 * Creative Hub API client — connects Skit Trainer to the local AI backend.
 *
 * Backend: FastAPI at http://localhost:8420
 * Source: ~/Projects/creative-hub/
 * Start: ~/Projects/creative-hub/scripts/start_services.sh all
 */

const BASE_URL = 'http://localhost:8420'

// ── Types ──────────────────────────────────────────────

export interface HubJob {
  id: number
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  params: Record<string, unknown>
  output_path: string | null
  error: string | null
  duration_seconds: number | null
  created_at: string
  metadata: Record<string, unknown> | null
}

export interface HubHealthStatus {
  status: 'ok' | 'degraded'
  services: {
    ollama: 'up' | 'down'
    comfyui: 'up' | 'down'
    tts: 'installed' | 'missing'
    audiocraft: 'installed' | 'missing'
    video: 'installed' | 'missing'
    hub_db: 'ok' | 'missing'
  }
}

export interface ImageRequest {
  prompt: string
  negative_prompt?: string
  width?: number
  height?: number
  steps?: number
  cfg?: number
}

export interface SpeechRequest {
  text: string
  language?: string
  speaker_wav?: string | null
}

export interface AudioRequest {
  prompt: string
  duration?: number
  model_size?: 'small' | 'medium' | 'large'
}

export interface VideoRequest {
  prompt: string
  num_frames?: number
  width?: number
  height?: number
  num_inference_steps?: number
}

export interface TextRequest {
  prompt: string
  model?: string
  system?: string
}

export interface TextResponse {
  job_id: number
  status: 'completed'
  response: string
}

export interface FeedbackRequest {
  job_id: number
  rating: number  // 1-5
  comment?: string
  user_id?: string
}

export interface FeedbackSummary {
  total_feedback: number
  overall_avg: number
  by_type: Record<string, { count: number; avg_rating: number }>
  low_rated_jobs: Array<{ job_id: number; type: string; avg_rating: number }>
}

// ── Client ─────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Hub API error: ${res.status} ${await res.text()}`)
  return res.json()
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`Hub API error: ${res.status} ${await res.text()}`)
  return res.json()
}

// ── Generation ─────────────────────────────────────────

/** POST an async generation job. Returns job_id to poll. */
export async function generateImage(req: ImageRequest) {
  return post<{ job_id: number; status: string; poll: string }>('/generate/image', req)
}

export async function generateSpeech(req: SpeechRequest) {
  return post<{ job_id: number; status: string; poll: string }>('/generate/speech', req)
}

export async function generateAudio(req: AudioRequest) {
  return post<{ job_id: number; status: string; poll: string }>('/generate/audio', req)
}

export async function generateVideo(req: VideoRequest) {
  return post<{ job_id: number; status: string; poll: string }>('/generate/video', req)
}

/** Synchronous — Ollama returns inline. */
export async function generateText(req: TextRequest) {
  return post<TextResponse>('/generate/text', req)
}

// ── Job polling ────────────────────────────────────────

export async function getJob(jobId: number): Promise<HubJob> {
  return get<HubJob>(`/jobs/${jobId}`)
}

/** Returns the raw file URL for a completed job. */
export function getJobOutputUrl(jobId: number): string {
  return `${BASE_URL}/jobs/${jobId}/output`
}

/** Returns a direct static file URL. */
export function getFileUrl(type: 'images' | 'speech' | 'audio' | 'video', filename: string): string {
  return `${BASE_URL}/files/${type}/${filename}`
}

/**
 * Poll a job until it completes or fails.
 * Returns the completed job, or throws on failure/timeout.
 */
export async function pollJob(
  jobId: number,
  intervalMs = 2000,
  timeoutMs = 300000,
): Promise<HubJob> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const job = await getJob(jobId)
    if (job.status === 'completed') return job
    if (job.status === 'failed') throw new Error(job.error || 'Job failed')
    await new Promise(r => setTimeout(r, intervalMs))
  }
  throw new Error('Job timed out')
}

// ── Feedback ───────────────────────────────────────────

export async function submitFeedback(req: FeedbackRequest) {
  return post<{ status: string; total_feedback: number; avg_rating: number }>('/feedback', req)
}

export async function getFeedbackSummary(jobType?: string) {
  const query = jobType ? `?job_type=${jobType}` : ''
  return get<FeedbackSummary>(`/feedback/summary${query}`)
}

// ── Health & Status ────────────────────────────────────

export async function getHealth(): Promise<HubHealthStatus> {
  return get<HubHealthStatus>('/health')
}

export async function getHubStatus() {
  return get<Record<string, number>>('/status')
}

/**
 * Check if the creative hub backend is reachable.
 * Non-throwing — returns false if down.
 */
export async function isHubAvailable(): Promise<boolean> {
  try {
    await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) })
    return true
  } catch {
    return false
  }
}
