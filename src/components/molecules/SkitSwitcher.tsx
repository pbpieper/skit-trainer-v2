import type { Skit } from '@/types/skit'
import clsx from 'clsx'

interface Props {
  skits: Skit[]
  currentId: string
  onSelect: (id: string) => void
  onAddClick: () => void
}

export function SkitSwitcher({ skits, currentId, onSelect, onAddClick }: Props) {
  return (
    <div className="flex gap-1.5 mb-3 flex-wrap">
      {skits.map(s => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={clsx(
            'px-4 py-2 rounded-xl border-2 text-xs font-semibold cursor-pointer transition-colors',
            currentId === s.id
              ? 'border-[var(--color-green-main)] bg-[var(--color-green-faded)] text-[var(--color-green-dark)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-green-light)]'
          )}
        >
          {"📚"} {s.title}
        </button>
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
