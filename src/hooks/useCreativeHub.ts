import { useState, useEffect, useCallback } from 'react'
import * as hub from '@/services/creativeHub'

/**
 * Hook for interacting with the Creative Hub backend.
 * Handles availability detection, job polling, and error states.
 */
export function useCreativeHub() {
  const [available, setAvailable] = useState<boolean | null>(null) // null = checking

  useEffect(() => {
    hub.isHubAvailable().then(setAvailable)
  }, [])

  /** Generate speech and poll until done. Returns the audio URL. */
  const speak = useCallback(async (text: string) => {
    const { job_id } = await hub.generateSpeech({ text })
    const job = await hub.pollJob(job_id)
    return hub.getJobOutputUrl(job.id)
  }, [])

  /** Generate an image and poll until done. Returns the image URL. */
  const generateImage = useCallback(async (prompt: string, opts?: Partial<hub.ImageRequest>) => {
    const { job_id } = await hub.generateImage({ prompt, ...opts })
    const job = await hub.pollJob(job_id)
    return hub.getJobOutputUrl(job.id)
  }, [])

  /** Generate music/audio and poll until done. Returns the audio URL. */
  const generateAudio = useCallback(async (prompt: string, duration = 10) => {
    const { job_id } = await hub.generateAudio({ prompt, duration })
    const job = await hub.pollJob(job_id)
    return hub.getJobOutputUrl(job.id)
  }, [])

  /** Ask a local LLM. Synchronous — returns text. */
  const askLLM = useCallback(async (prompt: string, opts?: { model?: string; system?: string }) => {
    const res = await hub.generateText({ prompt, ...opts })
    return res.response
  }, [])

  /** Submit feedback on a job. */
  const feedback = useCallback(async (jobId: number, rating: number, comment?: string, userId?: string) => {
    return hub.submitFeedback({ job_id: jobId, rating, comment, user_id: userId })
  }, [])

  return {
    available,
    speak,
    generateImage,
    generateAudio,
    askLLM,
    feedback,
    // Raw access for advanced usage
    raw: hub,
  }
}
