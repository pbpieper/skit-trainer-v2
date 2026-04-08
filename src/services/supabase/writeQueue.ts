import { supabase } from './client'

const STORAGE_KEY = 'skit-trainer:write-queue'
const MAX_RETRIES = 5
const BASE_BACKOFF_MS = 1000

export interface QueuedWrite {
  id: string
  table: string
  operation: 'upsert' | 'insert' | 'update' | 'delete'
  data: Record<string, unknown>
  match?: Record<string, unknown>
  createdAt: number
  retries: number
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export class WriteQueue {
  private queue: QueuedWrite[] = []
  private flushTimer: number | null = null
  private flushing = false
  private debounceMs: number
  private backoffTimer: number | null = null

  constructor(debounceMs = 2000) {
    this.debounceMs = debounceMs
    this.restoreQueue()
    this.registerBeforeUnload()

    // If there were pending writes from a previous session, flush them
    if (this.queue.length > 0) {
      this.scheduleFlush()
    }
  }

  enqueue(write: Omit<QueuedWrite, 'id' | 'createdAt' | 'retries'>): void {
    const entry: QueuedWrite = {
      ...write,
      id: generateId(),
      createdAt: Date.now(),
      retries: 0,
    }

    this.queue.push(entry)
    this.persistQueue()
    this.scheduleFlush()
  }

  private scheduleFlush(): void {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer)
    }
    this.flushTimer = window.setTimeout(() => {
      this.flushTimer = null
      this.flush()
    }, this.debounceMs)
  }

  private async flush(): Promise<void> {
    if (this.flushing || this.queue.length === 0) return
    this.flushing = true

    // Snapshot current queue and clear it — failed items get re-added
    const batch = [...this.queue]
    this.queue = []

    const failed: QueuedWrite[] = []

    for (const write of batch) {
      try {
        await this.executeWrite(write)
      } catch (err) {
        console.error(`[WriteQueue] Failed write to ${write.table}:`, err)
        if (write.retries < MAX_RETRIES) {
          failed.push({ ...write, retries: write.retries + 1 })
        } else {
          console.error(
            `[WriteQueue] Dropping write after ${MAX_RETRIES} retries:`,
            write
          )
          // Save to dead-letter queue in localStorage
          try {
            const deadLetters = JSON.parse(localStorage.getItem('skit-trainer:dead-letters') || '[]')
            deadLetters.push({ ...write, failedAt: new Date().toISOString(), error: String(err) })
            localStorage.setItem('skit-trainer:dead-letters', JSON.stringify(deadLetters))
          } catch {
            // localStorage may be full or unavailable — not fatal
          }
        }
      }
    }

    if (failed.length > 0) {
      // Prepend failed items so they retry before newer writes
      this.queue = [...failed, ...this.queue]
      this.persistQueue()

      // Retry with exponential backoff based on the highest retry count
      const maxRetry = Math.max(...failed.map((w) => w.retries))
      const backoff = BASE_BACKOFF_MS * Math.pow(2, maxRetry - 1)

      if (this.backoffTimer !== null) {
        clearTimeout(this.backoffTimer)
      }
      this.backoffTimer = window.setTimeout(() => {
        this.backoffTimer = null
        this.flush()
      }, backoff)
    } else {
      this.persistQueue()
    }

    this.flushing = false
  }

  private async executeWrite(write: QueuedWrite): Promise<void> {
    const { table, operation, data, match } = write

    switch (operation) {
      case 'upsert': {
        const query = match
          ? supabase.from(table).upsert(data, { onConflict: Object.keys(match).join(',') })
          : supabase.from(table).upsert(data)
        const { error } = await query
        if (error) throw error
        break
      }
      case 'insert': {
        const { error } = await supabase.from(table).insert(data)
        if (error) throw error
        break
      }
      case 'update': {
        if (!match) throw new Error('update requires match keys')
        let query = supabase.from(table).update(data)
        for (const [key, value] of Object.entries(match)) {
          query = query.eq(key, value as string | number)
        }
        const { error } = await query
        if (error) throw error
        break
      }
      case 'delete': {
        if (!match) throw new Error('delete requires match keys')
        let query = supabase.from(table).delete()
        for (const [key, value] of Object.entries(match)) {
          query = query.eq(key, value as string | number)
        }
        const { error } = await query
        if (error) throw error
        break
      }
    }
  }

  private persistQueue(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue))
    } catch {
      // localStorage may be full or unavailable — not fatal
    }
  }

  private restoreQueue(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as QueuedWrite[]
        if (Array.isArray(parsed)) {
          this.queue = parsed
        }
      }
    } catch {
      // Corrupted data — start fresh
      this.queue = []
    }
  }

  private registerBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      // Persist whatever is left so it survives the reload
      this.persistQueue()

      // Attempt a synchronous flush via sendBeacon for any pending writes
      if (this.queue.length > 0) {
        // sendBeacon can only POST to a URL, so we persist and rely on
        // the next session picking up the queue via restoreQueue()
        this.persistQueue()
      }
    })
  }

  /** Number of pending writes in the queue */
  get pending(): number {
    return this.queue.length
  }

  destroy(): void {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
    if (this.backoffTimer !== null) {
      clearTimeout(this.backoffTimer)
      this.backoffTimer = null
    }
    // Persist remaining items for the next session
    this.persistQueue()
  }
}

// Singleton instance
export const writeQueue = new WriteQueue()
