export interface SkitProgress {
  chunkMastered: Set<string>
  recallScores: Record<number, string>
  chainCompleted: Set<number>
  flashcardStats: { correct: number; wrong: number }
}

export type ProgressBySkitId = Record<string, SkitProgress>

export interface ProgressExport {
  userId: string
  exportedAt: string
  progress: Record<string, {
    chunkMastered: string[]
    recallScores: Record<number, string>
    chainCompleted: number[]
    flashcardStats: { correct: number; wrong: number }
  }>
}

export function createEmptyProgress(): SkitProgress {
  return {
    chunkMastered: new Set(),
    recallScores: {},
    chainCompleted: new Set(),
    flashcardStats: { correct: 0, wrong: 0 },
  }
}
