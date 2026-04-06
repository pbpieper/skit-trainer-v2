import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Chunk, FlatLine, MacroSection, MesoSection, MicroSection, SubChunk } from '@/types/skit'
import { useApp } from '@/context/AppContext'
import { splitIntoSubChunks } from '@/lib/helpers'

interface SkitContextValue {
  chunks: Chunk[]
  flatLines: FlatLine[]
  macroSections: MacroSection[]
  mesoSections: MesoSection[]
  microSections: MicroSection[]
  subChunksMap: Record<number, SubChunk[]>
  palaceImages: string[]
  skitId: string
  skitTitle: string
  skitSubtitle: string
  speakers: string[]
  tags: string[]
}

const SkitCtx = createContext<SkitContextValue | null>(null)

export function useSkitContext() {
  const ctx = useContext(SkitCtx)
  if (!ctx) throw new Error('useSkitContext must be used within SkitProvider')
  return ctx
}

export function SkitProvider({ children }: { children: ReactNode }) {
  const { currentSkitId, skitLibrary } = useApp()
  const currentSkit = useMemo(() => skitLibrary.find(s => s.id === currentSkitId), [skitLibrary, currentSkitId])

  const flatLines = useMemo<FlatLine[]>(() => {
    if (!currentSkit) return []
    return currentSkit.chunks.flatMap(c =>
      c.lines.map(l => ({ ...l, chunkId: c.id, chunkLabel: c.label }))
    )
  }, [currentSkit])

  const mesoSections = useMemo<MesoSection[]>(() => {
    if (!currentSkit) return []
    return currentSkit.chunks.map(c => ({
      id: `meso_${c.id}`,
      label: `${c.id}. ${c.label}`,
      chunks: [c.id],
    }))
  }, [currentSkit])

  const microSections = useMemo<MicroSection[]>(() => {
    return flatLines.map((line, i) => ({
      id: `micro_${i}`,
      label: `L${i + 1}: ${line.speaker} — ${line.text.slice(0, 40)}...`,
      lineIdx: i,
    }))
  }, [flatLines])

  const subChunksMap = useMemo(() => {
    if (!currentSkit) return {}
    const map: Record<number, SubChunk[]> = {}
    currentSkit.chunks.forEach(c => {
      map[c.id] = splitIntoSubChunks(c)
    })
    return map
  }, [currentSkit])

  const value = useMemo<SkitContextValue | null>(() => {
    if (!currentSkit) return null
    return {
      chunks: currentSkit.chunks,
      flatLines,
      macroSections: currentSkit.macroSections,
      mesoSections,
      microSections,
      subChunksMap,
      palaceImages: currentSkit.palaceImages,
      skitId: currentSkit.id,
      skitTitle: currentSkit.title,
      skitSubtitle: currentSkit.subtitle,
      speakers: currentSkit.speakers,
      tags: currentSkit.tags ?? [],
    }
  }, [currentSkit, flatLines, mesoSections, microSections, subChunksMap])

  if (!value) return null

  return (
    <SkitCtx.Provider value={value}>
      {children}
    </SkitCtx.Provider>
  )
}
