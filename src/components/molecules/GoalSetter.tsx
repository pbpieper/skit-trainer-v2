import { useState } from 'react'
import { useGoal } from '@/context/GoalContext'
import { useStar } from '@/context/StarContext'
import { useApp } from '@/context/AppContext'

export function GoalSetter() {
  const { currentGoal, createGoal, deleteGoal } = useGoal()
  const { isStarred } = useStar()
  const { currentSkitId } = useApp()
  const [date, setDate] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Only show for starred skits
  if (!isStarred(currentSkitId)) return null

  if (currentGoal) {
    const target = new Date(currentGoal.targetDate + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysLeft = Math.ceil((target.getTime() - today.getTime()) / 86400000)
    const isPast = daysLeft < 0

    return (
      <div className="p-3 rounded-xl border mb-3 bg-[var(--color-surface-alt)] border-[var(--color-green-light)]">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-[var(--color-green-dark)]">
              🎯 Goal: {target.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span className={`ml-2 text-[11px] font-semibold ${isPast ? 'text-[var(--color-pink)]' : 'text-[var(--color-green-main)]'}`}>
              {isPast ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Today!' : `${daysLeft} days left`}
            </span>
          </div>
          <button
            onClick={deleteGoal}
            className="text-[10px] px-2 py-0.5 rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-pink)] hover:border-[var(--color-pink)] cursor-pointer bg-transparent transition-colors"
          >
            Remove goal
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          {currentGoal.plan.categories.map(cat => (
            <span
              key={cat.name}
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--color-green-faded)] text-[var(--color-green-dark)]"
            >
              {cat.label}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (isCreating) {
    const minDate = new Date().toISOString().slice(0, 10)
    return (
      <div className="p-3 rounded-xl border mb-3 bg-[var(--color-surface-alt)] border-[var(--color-green-light)]">
        <p className="text-xs font-bold text-[var(--color-green-dark)] mb-2">🎯 Set a learning deadline</p>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={e => setDate(e.target.value)}
            className="px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)]"
          />
          <button
            onClick={async () => {
              if (date) {
                await createGoal(date)
                setIsCreating(false)
              }
            }}
            disabled={!date}
            className="px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border-none text-white disabled:opacity-40"
            style={{ background: 'var(--color-green-main)' }}
          >
            Generate Plan
          </button>
          <button
            onClick={() => setIsCreating(false)}
            className="text-xs text-[var(--color-text-muted)] cursor-pointer bg-transparent border-none"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsCreating(true)}
      className="w-full p-2.5 rounded-xl border border-dashed border-[var(--color-green-light)] mb-3 text-xs font-semibold text-[var(--color-green-main)] bg-transparent hover:bg-[var(--color-green-faded)] cursor-pointer transition-colors"
    >
      🎯 Set learning goal for this skit
    </button>
  )
}
