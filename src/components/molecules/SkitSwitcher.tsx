import { useMemo } from 'react'
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

  // Sort: starred skits first, then preserve original order within each group
  const sortedSkits = useMemo(() => {
    const starred = skits.filter(s => isStarred(s.id))
    const unstarred = skits.filter(s => !isStarred(s.id))
    return [...starred, ...unstarred]
  }, [skits, isStarred])

  return (
    <div className="flex gap-1.5 mb-3 flex-wrap">
      {sortedSkits.map(s => {
        const starred = isStarred(s.id)
        const active = currentId === s.id

        return (
          <div
            key={s.id}
            className={clsx(
              'flex items-center rounded-xl transition-shadow',
              starred && !active && 'ring-1 ring-[var(--color-pink-mid,#f48fb1)]',
            )}
          >
            <button
              onClick={() => onSelect(s.id)}
              className={clsx(
                'px-4 py-2 rounded-l-xl border-2 border-r-0 text-xs font-semibold cursor-pointer transition-colors',
                active
                  ? 'border-[var(--color-green-main)] bg-[var(--color-green-faded)] text-[var(--color-green-dark)]'
                  : starred
                  ? 'border-[var(--color-pink-mid,#f48fb1)] bg-[var(--color-pink-faded,#fce4ec)] text-[var(--color-pink-dark,#880e4f)] hover:border-[var(--color-pink)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-green-light)]'
              )}
            >
              {starred ? '' : ''} {s.title}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleStar(s.id)
              }}
              className={clsx(
                'px-2.5 py-2 rounded-r-xl border-2 border-l-0 text-sm cursor-pointer transition-all',
                active
                  ? 'border-[var(--color-green-main)] bg-[var(--color-green-faded)]'
                  : starred
                  ? 'border-[var(--color-pink-mid,#f48fb1)] bg-[var(--color-pink-faded,#fce4ec)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-green-light)]',
                starred
                  ? 'hover:opacity-70'
                  : 'opacity-40 hover:opacity-100'
              )}
              title={starred ? 'Unstar skit' : 'Star skit'}
            >
              {starred ? '\u2B50' : '\u2606'}
            </button>
          </div>
        )
      })}
      <button
        onClick={onAddClick}
        className="px-4 py-2 rounded-xl border-2 border-dashed border-[var(--color-border)] bg-transparent text-xs font-semibold text-[var(--color-text-muted)] cursor-pointer hover:border-[var(--color-green-main)] hover:text-[var(--color-green-main)] transition-colors"
      >
        + Add Skit
      </button>
    </div>
  )
}
