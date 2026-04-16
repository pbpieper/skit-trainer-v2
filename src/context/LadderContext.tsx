import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { LadderProgress, ChallengeAttempt, LadderLevelId, ChallengeType } from '@/types/ladder'
import {
  isLevelUnlocked,
  isLevelCompleted,
  unlockUpToLevel,
} from '@/types/ladder'
import { useServices } from '@/services/ServiceProvider'
import { useUser } from '@/context/UserContext'
import { useApp } from '@/context/AppContext'

interface LadderContextValue {
  progress: LadderProgress | null
  isLoading: boolean
  attemptChallenge: (levelId: LadderLevelId, score: number, challengeType: ChallengeType) => Promise<boolean>
  completeTask: (levelId: LadderLevelId) => Promise<void>
  isLevelUnlocked: (levelId: LadderLevelId) => boolean
  isLevelCompleted: (levelId: LadderLevelId) => boolean
  getLevelProgress: (levelId: LadderLevelId) => { tasksCompleted: number; bestScore: number | null }
  getChallengeHistory: () => Promise<ChallengeAttempt[]>
}

const LadderCtx = createContext<LadderContextValue>({
  progress: null,
  isLoading: true,
  attemptChallenge: async () => false,
  completeTask: async () => {},
  isLevelUnlocked: () => false,
  isLevelCompleted: () => false,
  getLevelProgress: () => ({ tasksCompleted: 0, bestScore: null }),
  getChallengeHistory: async () => [],
})

export function useLadder() {
  return useContext(LadderCtx)
}

export function LadderProvider({ children }: { children: ReactNode }) {
  const { ladderService } = useServices()
  const { user } = useUser()
  const { currentSkitId } = useApp()
  const [progress, setProgress] = useState<LadderProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [challengeHistory, setChallengeHistory] = useState<ChallengeAttempt[]>([])

  // Load ladder progress when user/skit changes
  useEffect(() => {
    if (!user || !currentSkitId) {
      setProgress(null)
      setIsLoading(false)
      return
    }

    const loadProgress = async () => {
      try {
        setIsLoading(true)
        const prog = await ladderService.getLadderProgress(user.id, currentSkitId)
        setProgress(prog)

        const history = await ladderService.getChallengeHistory(user.id, currentSkitId)
        setChallengeHistory(history)
      } catch (e) {
        console.warn('[LadderContext] Failed to load ladder progress:', e)
      } finally {
        setIsLoading(false)
      }
    }

    loadProgress()
  }, [user, currentSkitId, ladderService])

  const attemptChallenge = useCallback(
    async (
      levelId: LadderLevelId,
      score: number,
      challengeType: ChallengeType
    ): Promise<boolean> => {
      if (!user || !currentSkitId || !progress) return false

      const passed = score >= 60 // Threshold (varies by level, simplified here)

      try {
        // Record the attempt
        const attempt = await ladderService.recordChallengeAttempt({
          userId: user.id,
          skitId: currentSkitId,
          levelId,
          challengeType,
          score,
          passed,
          attemptedAt: new Date().toISOString(),
        })

        // Update progress if passed
        if (passed) {
          const updated = unlockUpToLevel(progress, levelId)
          // Update scores
          updated.levelScores[levelId] = Math.max(
            updated.levelScores[levelId] || 0,
            score
          )
          await ladderService.saveLadderProgress(user.id, currentSkitId, updated)
          setProgress(updated)
        }

        // Update challenge history
        setChallengeHistory(prev => [attempt, ...prev])
        return passed
      } catch (e) {
        console.error('[LadderContext] Failed to record challenge attempt:', e)
        return false
      }
    },
    [user, currentSkitId, progress, ladderService]
  )

  const completeTask = useCallback(
    async (levelId: LadderLevelId) => {
      if (!user || !currentSkitId || !progress) return

      try {
        const updated = { ...progress }
        updated.tasksCompleted[levelId] = (updated.tasksCompleted[levelId] || 0) + 1
        updated.updatedAt = new Date().toISOString()
        await ladderService.saveLadderProgress(user.id, currentSkitId, updated)
        setProgress(updated)
      } catch (e) {
        console.warn('[LadderContext] Failed to complete task:', e)
      }
    },
    [user, currentSkitId, progress, ladderService]
  )

  const isLevelUnlockedFn = useCallback(
    (levelId: LadderLevelId) => {
      if (!progress) return false
      return isLevelUnlocked(progress, levelId)
    },
    [progress]
  )

  const isLevelCompletedFn = useCallback(
    (levelId: LadderLevelId) => {
      if (!progress) return false
      return isLevelCompleted(progress, levelId)
    },
    [progress]
  )

  const getLevelProgress = useCallback(
    (levelId: LadderLevelId) => {
      if (!progress) return { tasksCompleted: 0, bestScore: null }
      return {
        tasksCompleted: progress.tasksCompleted[levelId] || 0,
        bestScore: progress.levelScores[levelId] || null,
      }
    },
    [progress]
  )

  const getChallengeHistoryFn = useCallback(async () => {
    return challengeHistory
  }, [challengeHistory])

  return (
    <LadderCtx.Provider
      value={{
        progress,
        isLoading,
        attemptChallenge,
        completeTask,
        isLevelUnlocked: isLevelUnlockedFn,
        isLevelCompleted: isLevelCompletedFn,
        getLevelProgress,
        getChallengeHistory: getChallengeHistoryFn,
      }}
    >
      {children}
    </LadderCtx.Provider>
  )
}
