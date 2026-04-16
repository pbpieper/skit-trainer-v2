import type { ToolId } from './tools'

/**
 * Memorization Ladder System
 *
 * 10 levels spanning all learning categories. Each level has:
 * - A set of practice tasks mixing tools from one or more categories
 * - A challenge gate with a threshold score to advance
 * - Flexible skip: users can attempt any level's challenge directly
 *
 * Practice tools are NEVER locked — users browse freely.
 * The ladder tracks proven mastery, not access.
 */

export type LadderLevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type ChallengeType = 'recall' | 'fill' | 'chain' | 'firstletter' | 'perform' | 'loci'

export interface LadderTaskTemplate {
  toolId: ToolId
  title: string
  description: string
}

export interface LadderChallenge {
  /** Which tool powers the challenge assessment */
  type: ChallengeType
  title: string
  description: string
  /** Minimum score (0-100) to pass */
  threshold: number
  /** Human-readable metric label, e.g., "fill accuracy" */
  metric: string
}

export interface LadderLevel {
  id: LadderLevelId
  name: string
  subtitle: string
  /** Descriptive — which learning categories this level draws from */
  categories: string
  /** Tasks the user should complete at this level */
  tasks: LadderTaskTemplate[]
  /** Gate to advance (or skip to) this level */
  challenge: LadderChallenge
  /** Estimated time hint */
  timeEstimate: string
}

// ─── Per-User Ladder Progress (persisted) ────────────────────────────

export interface LadderProgress {
  userId: string
  skitId: string
  /** Highest level the user is actively working on */
  currentLevel: LadderLevelId
  /** All levels the user has access to (includes skipped-to levels) */
  unlockedLevels: LadderLevelId[]
  /** Levels where the challenge has been passed */
  completedLevels: LadderLevelId[]
  /** Best challenge score per level */
  levelScores: Partial<Record<LadderLevelId, number>>
  /** Task completion counts per level (resets if user retakes) */
  tasksCompleted: Partial<Record<LadderLevelId, number>>
  updatedAt: string
}

export interface ChallengeAttempt {
  id: string
  userId: string
  skitId: string
  levelId: LadderLevelId
  challengeType: ChallengeType
  score: number
  passed: boolean
  attemptedAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────

export function createEmptyLadderProgress(userId: string, skitId: string): LadderProgress {
  return {
    userId,
    skitId,
    currentLevel: 1,
    unlockedLevels: [1],
    completedLevels: [],
    levelScores: {},
    tasksCompleted: {},
    updatedAt: new Date().toISOString(),
  }
}

export function isLevelUnlocked(progress: LadderProgress, levelId: LadderLevelId): boolean {
  return progress.unlockedLevels.includes(levelId)
}

export function isLevelCompleted(progress: LadderProgress, levelId: LadderLevelId): boolean {
  return progress.completedLevels.includes(levelId)
}

/**
 * After passing a challenge, unlock that level and all levels below it.
 * E.g., passing level 5 unlocks [1, 2, 3, 4, 5].
 */
export function unlockUpToLevel(progress: LadderProgress, levelId: LadderLevelId): LadderProgress {
  const newUnlocked = new Set(progress.unlockedLevels)
  const newCompleted = new Set(progress.completedLevels)

  for (let i = 1; i <= levelId; i++) {
    newUnlocked.add(i as LadderLevelId)
  }
  // Passing a challenge completes that level
  newCompleted.add(levelId)

  // Also mark all below as completed (if you can pass 5, you've proven 1-4)
  for (let i = 1; i < levelId; i++) {
    newCompleted.add(i as LadderLevelId)
  }

  // Advance current level to next if it was at or below the completed level
  const nextLevel = Math.min(10, levelId + 1) as LadderLevelId
  newUnlocked.add(nextLevel)

  return {
    ...progress,
    currentLevel: progress.currentLevel <= levelId ? nextLevel : progress.currentLevel,
    unlockedLevels: [...newUnlocked].sort((a, b) => a - b) as LadderLevelId[],
    completedLevels: [...newCompleted].sort((a, b) => a - b) as LadderLevelId[],
    updatedAt: new Date().toISOString(),
  }
}
