import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { LearningGoal, DailyTask, SkitStreak } from '@/types/goals'
import { useServices } from '@/services/ServiceProvider'
import { useUser } from '@/context/UserContext'
import { useApp } from '@/context/AppContext'
import { useProgress } from '@/context/ProgressContext'
import { generatePlan, generateDailyTasks } from '@/lib/planGenerator'

interface GoalContextValue {
  currentGoal: LearningGoal | null
  allGoals: LearningGoal[]
  todayTasks: DailyTask[]
  streak: SkitStreak | null
  pendingCompletions: Set<string>
  createGoal: (targetDate: string) => Promise<void>
  deleteGoal: () => Promise<void>
  completeTask: (taskId: string) => Promise<void>
  uncompleteTask: (taskId: string) => Promise<void>
  isTaskLocked: (task: DailyTask) => boolean
  refreshTasks: () => Promise<void>
}

const GoalCtx = createContext<GoalContextValue>({
  currentGoal: null,
  allGoals: [],
  todayTasks: [],
  streak: null,
  pendingCompletions: new Set(),
  createGoal: async () => {},
  deleteGoal: async () => {},
  completeTask: async () => {},
  uncompleteTask: async () => {},
  isTaskLocked: () => false,
  refreshTasks: async () => {},
})

export function useGoal() {
  return useContext(GoalCtx)
}

export function GoalProvider({ children }: { children: ReactNode }) {
  const { goalService, taskService } = useServices()
  const { user } = useUser()
  const { currentSkitId, skitLibrary } = useApp()
  const { progress } = useProgress()
  const [currentGoal, setCurrentGoal] = useState<LearningGoal | null>(null)
  const [allGoals, setAllGoals] = useState<LearningGoal[]>([])
  const [todayTasks, setTodayTasks] = useState<DailyTask[]>([])
  const [streak, setStreak] = useState<SkitStreak | null>(null)
  const [pendingCompletions, setPendingCompletions] = useState<Set<string>>(new Set())

  const today = new Date().toISOString().slice(0, 10)
  const currentSkit = skitLibrary.find(s => s.id === currentSkitId)

  // Load goals when user/skit changes
  useEffect(() => {
    if (!user) return
    goalService.getGoals(user.id).then(setAllGoals)
  }, [user, goalService])

  // Load current goal for active skit
  useEffect(() => {
    if (!user || !currentSkitId) return
    goalService.getGoalForSkit(user.id, currentSkitId).then(setCurrentGoal)
  }, [user, currentSkitId, goalService, allGoals])

  // Load/generate today's tasks
  const refreshTasks = useCallback(async () => {
    if (!user || !currentSkitId || !currentGoal || !currentSkit) return

    let tasks = await taskService.getTasksForSkit(user.id, currentSkitId, today)
    if (tasks.length === 0) {
      // Generate tasks for today
      tasks = generateDailyTasks(
        currentGoal.id,
        user.id,
        currentSkit,
        currentGoal.targetDate,
        today,
        progress,
      )
      await taskService.saveTasks(tasks)
    }
    setTodayTasks(tasks)
  }, [user, currentSkitId, currentGoal, currentSkit, today, progress, taskService])

  useEffect(() => {
    refreshTasks()
  }, [refreshTasks])

  // Load streak
  useEffect(() => {
    if (!user || !currentSkitId) return
    taskService.getStreak(user.id, currentSkitId).then(setStreak)
  }, [user, currentSkitId, taskService])

  const createGoalFn = useCallback(async (targetDate: string) => {
    if (!user || !currentSkit) return
    const plan = generatePlan(currentSkit, targetDate, progress)
    const goal = await goalService.createGoal({
      userId: user.id,
      skitId: currentSkitId,
      targetDate,
      plan,
    })
    setCurrentGoal(goal)
    setAllGoals(prev => [...prev.filter(g => g.skitId !== currentSkitId), goal])
  }, [user, currentSkit, currentSkitId, progress, goalService])

  const deleteGoalFn = useCallback(async () => {
    if (!currentGoal) return
    await goalService.deleteGoal(currentGoal.id)
    setCurrentGoal(null)
    setAllGoals(prev => prev.filter(g => g.id !== currentGoal.id))
    setTodayTasks([])
  }, [currentGoal, goalService])

  const completeTaskFn = useCallback(async (taskId: string) => {
    // Optimistically update UI immediately
    const now = new Date().toISOString()
    setTodayTasks(prev => prev.map(t => t.id === taskId ? { ...t, completedAt: now } : t))
    setPendingCompletions(prev => new Set(prev).add(taskId))

    try {
      const task = await taskService.completeTask(taskId)
      // Reconcile with the real result from service
      setTodayTasks(prev => prev.map(t => t.id === taskId ? task : t))

      // Check if all tasks for this skit today are done -> update streak
      const allDone = todayTasks.every(t => t.id === taskId ? true : t.completedAt !== null)
      if (allDone && user) {
        const updated = await taskService.updateStreak(user.id, currentSkitId)
        setStreak(updated)
      }
    } finally {
      setPendingCompletions(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }, [taskService, todayTasks, user, currentSkitId])

  const uncompleteTaskFn = useCallback(async (taskId: string) => {
    // Optimistically update UI immediately
    setTodayTasks(prev => prev.map(t => t.id === taskId ? { ...t, completedAt: null } : t))
    setPendingCompletions(prev => new Set(prev).add(taskId))

    try {
      const task = await taskService.uncompleteTask(taskId)
      setTodayTasks(prev => prev.map(t => t.id === taskId ? task : t))
    } finally {
      setPendingCompletions(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }, [taskService])

  const isTaskLocked = useCallback((task: DailyTask) => {
    if (task.dependsOn.length === 0) return false
    return task.dependsOn.some(depId => {
      const dep = todayTasks.find(t => t.id === depId)
      return dep && !dep.completedAt
    })
  }, [todayTasks])

  return (
    <GoalCtx.Provider value={{
      currentGoal,
      allGoals,
      todayTasks,
      streak,
      pendingCompletions,
      createGoal: createGoalFn,
      deleteGoal: deleteGoalFn,
      completeTask: completeTaskFn,
      uncompleteTask: uncompleteTaskFn,
      isTaskLocked,
      refreshTasks,
    }}>
      {children}
    </GoalCtx.Provider>
  )
}
