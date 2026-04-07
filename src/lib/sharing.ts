import type { Skit, Chunk } from '@/types/skit'

/**
 * Encode a skit to a base64 string suitable for sharing via URL.
 * Only includes the content fields — not id, timestamps, or createdBy.
 */
export function encodeSkitForShare(skit: Skit): string {
  try {
    const data = {
      title: skit.title,
      subtitle: skit.subtitle,
      speakers: skit.speakers,
      chunks: skit.chunks,
      macroSections: skit.macroSections,
      ...(skit.tags && skit.tags.length > 0 ? { tags: skit.tags } : {}),
    }
    return btoa(JSON.stringify(data))
  } catch {
    return ''
  }
}

/**
 * Decode a skit from a `?skit=` URL parameter.
 * Returns a new Skit object with a generated id and timestamps, or null on failure.
 */
export function decodeSkitFromUrl(encoded: string): Skit | null {
  try {
    const data = JSON.parse(atob(encoded))
    if (!data.title || !data.chunks) return null
    const now = new Date().toISOString()
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: data.title,
      subtitle: data.subtitle || '',
      speakers: data.speakers || [''],
      chunks: data.chunks as Chunk[],
      macroSections: data.macroSections || [
        { id: 'all', label: 'Full Text', chunks: (data.chunks as Chunk[]).map((c: Chunk) => c.id) },
      ],
      tags: data.tags || [],
      palaceImages: [],
      createdAt: now,
      updatedAt: now,
    }
  } catch {
    return null
  }
}

/**
 * Build a full shareable URL for a skit.
 */
export function buildShareUrl(skit: Skit): string {
  const encoded = encodeSkitForShare(skit)
  if (!encoded) return ''
  return `${window.location.origin}${window.location.pathname}?skit=${encoded}`
}
