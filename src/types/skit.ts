export interface Line {
  speaker: string
  text: string
  anchor?: string
  visual?: string
}

export interface Chunk {
  id: number
  label: string
  lines: Line[]
}

export interface SubChunk {
  id: number
  subId: string
  label: string
  anchor?: string
  visual?: string
  lines: Line[]
}

export interface MacroSection {
  id: string
  label: string
  chunks: number[]
}

export interface MesoSection {
  id: string
  label: string
  chunks: number[]
}

export interface MicroSection {
  id: string
  label: string
  lineIdx: number
}

export interface Skit {
  id: string
  title: string
  subtitle: string
  speakers: string[]
  chunks: Chunk[]
  palaceImages: string[]
  macroSections: MacroSection[]
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface FlatLine extends Line {
  chunkId: number
  chunkLabel: string
}
