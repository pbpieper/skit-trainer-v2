import type { Chunk, SubChunk, FlatLine, MacroSection } from '@/types/skit'

const WORD_THRESHOLD = 30

export function splitIntoSubChunks(chunk: Chunk): SubChunk[] {
  const subs: SubChunk[] = []
  chunk.lines.forEach(line => {
    const words = line.text.split(/\s+/)
    if (words.length <= WORD_THRESHOLD) {
      subs.push({
        id: chunk.id,
        subId: String.fromCharCode(97 + subs.length), // a, b, c...
        label: `${chunk.label} (${String.fromCharCode(97 + subs.length)})`,
        lines: [{ speaker: line.speaker, text: line.text }],
      })
      return
    }
    // Split by sentences
    const sentences = line.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [line.text]
    let accum: string[] = []
    let accumWords = 0
    let letter = String.fromCharCode(97 + subs.length)
    sentences.forEach(sentence => {
      const trimmed = sentence.trim()
      const wc = trimmed.split(/\s+/).length
      if (accumWords + wc > WORD_THRESHOLD && accum.length > 0) {
        subs.push({
          id: chunk.id,
          subId: letter,
          label: `${chunk.label} (${letter})`,
          lines: [{ speaker: line.speaker, text: accum.join(' ') }],
        })
        letter = String.fromCharCode(letter.charCodeAt(0) + 1)
        accum = []
        accumWords = 0
      }
      accum.push(trimmed)
      accumWords += wc
    })
    if (accum.length > 0) {
      subs.push({
        id: chunk.id,
        subId: letter,
        label: `${chunk.label} (${letter})`,
        lines: [{ speaker: line.speaker, text: accum.join(' ') }],
      })
    }
  })
  return subs
}

export function getLinesForGranularity(
  granularity: string,
  sectionId: string,
  flatLines: FlatLine[],
  macroSections: MacroSection[]
): FlatLine[] {
  if (granularity === 'micro') {
    const idx = parseInt(sectionId.replace('micro_', ''), 10)
    return [flatLines[idx]].filter(Boolean)
  }
  if (granularity === 'meso') {
    const cid = parseInt(sectionId.replace('meso_', ''), 10)
    return flatLines.filter(l => l.chunkId === cid)
  }
  const sec = macroSections.find(s => s.id === sectionId)
  if (!sec) return flatLines
  return flatLines.filter(l => sec.chunks.includes(l.chunkId))
}

export function getLinesForSection(
  sectionId: string,
  flatLines: FlatLine[],
  macroSections: MacroSection[],
  chunks: { id: number }[]
): FlatLine[] {
  if (sectionId.startsWith('c')) {
    const cid = Number(sectionId.slice(1))
    return flatLines.filter(l => l.chunkId === cid)
  }
  const sec = macroSections.find(s => s.id === sectionId)
  if (!sec) return flatLines
  return flatLines.filter(l => sec.chunks.includes(l.chunkId))
}
