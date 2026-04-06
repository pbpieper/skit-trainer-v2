import type { Skit } from '@/types/skit'
import { useStar } from '@/context/StarContext'
import clsx from 'clsx'

interface Props {
  skits: Skit[]
  currentId: string
  onSelect: (id: string) => void
  onAddClick: () => void
}

export function SkitSwitcher({ skits, currentId, onSelect, onAddClick }: Props) {
  const { isStarred, toggleStar } = useStar()

  return (
    <div className="flex gap-1.5 mb-3 flex-wrap">
      {skits.map(s => (
        <div key={s.id} className="flex items-center">
          <button
            onClick={() => onSelect(s.id)}
            className={clsx(
              'px-4 py-2 rounded-l-xl border-2 border-r-0 text-xs font-semibold cursor-pointer transition-colors',
              currentId === s.id
                ? 'border-[var(--color-green-main)] bg-[var(--color-green-faded)] text-[var(--color-green-dark)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-green-light)]'
            )}
          >
            {"📚"} {s.title}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleStar(s.id)
            }}
            className={clsx(
              'px-2 py-2 rounded-r-xl border-2 border-l-0 text-xs cursor-pointer transition-colors',
              currentId === s.id
                ? 'border-[var(--color-green-main)] bg-[var(--color-green-faded)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-green-light)]'
            )}
            title={isStarred(s.id) ? 'Unstar skit' : 'Star skit'}
          >
            {isStarred(s.id) ? '⭐' : '☆'}
          </button>
        </div>
      ))}
      <button
        onClick={onAddClick}
        className="px-4 py-2 rounded-xl border-2 border-dashed border-[var(--color-border)] bg-transparent text-xs font-semibold text-[var(--color-text-muted)] cursor-pointer hover:border-[var(--color-green-main)] hover:text-[var(--color-green-main)] transition-colors"
      >
        + Add Skit
      </button>
    </div>
  )
}
