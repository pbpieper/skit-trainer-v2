import { useGoal } from '@/context/GoalContext'
import { useApp } from '@/context/AppContext'
import type { DailyTask, PlanCategory } from '@/types/goals'
import type { ToolId } from '@/types/tools'

const CATEGORY_COLORS: Record<PlanCategory['name'], { bg: string; text: string; border: string }> = {
  foundation: { bg: 'var(--color-green-faded)', text: 'var(--color-green-dark)', border: 'var(--color-green-light)' },
  retrieval: { bg: 'var(--color-pink-faded, #fce4ec)', text: 'var(--color-pink-dark, #880e4f)', border: 'var(--color-pink-mid, #f48fb1)' },
  integration: { bg: 'rgba(63, 81, 181, 0.08)', text: 'rgba(26, 35, 126, 1)', border: 'rgba(63, 81, 181, 0.3)' },
  transfer: { bg: 'rgba(255, 152, 0, 0.08)', text: 'rgba(230, 81, 0, 1)', border: 'rgba(255, 152, 0, 0.3)' },
}

const DIFFICULTY_LABELS = ['', '⚡', '⚡⚡', '⚡⚡⚡', '⚡⚡⚡⚡', '⚡⚡⚡⚡⚡']

interface Props {
  onNavigate: (toolId: ToolId) => void
}

export function DailyTodos({ onNavigate }: Props) {
  const { todayTasks, streak, completeTask, uncompleteTask, isTaskLocked, currentGoal } = useGoal()
  const { setActiveTool } = useApp()

  if (!currentGoal || todayTasks.length === 0) return null

  const completedCount = todayTasks.filter(t => t.completedAt).length
  const totalCount = todayTasks.length
  const allDone = completedCount === totalCount

  // Group by category
  const grouped = new Map<PlanCategory['name'], DailyTask[]>()
  for (const task of todayTasks) {
    const list = grouped.get(task.category) ?? []
    list.push(task)
    grouped.set(task.category, list)
  }

  const categoryOrder: PlanCategory['name'][] = ['foundation', 'retrieval', 'integration', 'transfer']

  return (
    <div className="p-3.5 rounded-xl border mb-3 bg-[var(--color-surface-alt)] border-[var(--color-border)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--color-green-dark)]">Today's Practice</span>
          {streak && streak.currentStreak > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--color-pink-faded,#fce4ec)] text-[var(--color-pink)]">
              🔥 {streak.currentStreak} day streak
            </span>
          )}
        </div>
        <span className={`text-xs font-bold ${allDone ? 'text-[var(--color-green-main)]' : 'text-[var(--color-text-muted)]'}`}>
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-[var(--color-gray-100)] mb-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${(completedCount / totalCount) * 100}%`,
            background: allDone ? 'var(--color-green-main)' : 'var(--color-green-bright)',
          }}
        />
      </div>

      {/* Tasks by category */}
      {categoryOrder.map(catName => {
        const tasks = grouped.get(catName)
        if (!tasks || tasks.length === 0) return null
        const colors = CATEGORY_COLORS[catName]
        const allCatDone = tasks.every(t => t.completedAt)

        return (
          <div key={catName} className="mb-2.5 last:mb-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                {catName}
              </span>
              {allCatDone && <span className="text-[10px] text-[var(--color-green-main)]">✓ Complete</span>}
            </div>
            {tasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                locked={isTaskLocked(task)}
                onToggle={() => task.completedAt ? uncompleteTask(task.id) : completeTask(task.id)}
                onNavigate={() => {
                  setActiveTool(task.toolId)
                  onNavigate(task.toolId)
                }}
              />
            ))}
          </div>
        )
      })}

      {/* All done celebration */}
      {allDone && (
        <div className="mt-3 p-2.5 rounded-lg text-center text-xs font-bold text-[var(--color-green-dark)] bg-[var(--color-green-faded)] border border-[var(--color-green-light)]">
          🎉 All tasks complete! {streak && streak.currentStreak > 1 ? `${streak.currentStreak} day streak!` : 'Streak started!'}
        </div>
      )}
    </div>
  )
}

function TaskRow({ task, locked, onToggle, onNavigate }: {
  task: DailyTask
  locked: boolean
  onToggle: () => void
  onNavigate: () => void
}) {
  const done = !!task.completedAt

  return (
    <div
      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg mb-1 transition-all ${
        locked ? 'opacity-40' : done ? 'opacity-70' : ''
      }`}
    >
      <button
        onClick={onToggle}
        disabled={locked}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer bg-transparent shrink-0 transition-colors ${
          done
            ? 'border-[var(--color-green-main)] bg-[var(--color-green-main)]'
            : locked
            ? 'border-[var(--color-gray-300)] cursor-not-allowed'
            : 'border-[var(--color-border)] hover:border-[var(--color-green-main)]'
        }`}
      >
        {done && <span className="text-white text-[11px]">✓</span>}
        {locked && <span className="text-[9px]">🔒</span>}
      </button>

      <div className="flex-1 min-w-0">
        <span className={`text-xs font-semibold ${done ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}>
          {task.title}
        </span>
        {task.description && (
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">{task.description}</p>
        )}
      </div>

      <span className="text-[9px] shrink-0">{DIFFICULTY_LABELS[task.difficulty]}</span>

      <button
        onClick={onNavigate}
        disabled={locked}
        className="px-2 py-0.5 rounded-md border border-[var(--color-border)] text-[10px] font-semibold cursor-pointer bg-transparent text-[var(--color-green-main)] hover:bg-[var(--color-green-faded)] whitespace-nowrap shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Open →
      </button>
    </div>
  )
}
