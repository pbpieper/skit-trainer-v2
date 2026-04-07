import { useMemo, useState } from 'react'
import type { Skit } from '@/types/skit'
import { useStar } from '@/context/StarContext'
import { SEED_SKITS } from '@/data/skits'
import clsx from 'clsx'

type SortMode = 'recent' | 'az' | 'starred'

const SEED_IDS = new Set(SEED_SKITS.map(s => s.id))

interface Props {
  skits: Skit[]
  currentId: string
  onSelect: (id: string) => void
  onAddClick: () => void
  onDelete?: (id: string) => void
}

export function SkitSwitcher({ skits, currentId, onSelect, onAddClick, onDelete }: Props) {
  const { isStarred, toggleStar } = useStar()
  const [sortMode, setSortMode] = useState<SortMode>('starred')

  const sortedSkits = useMemo(() => {
    const arr = [...skits]
    switch (sortMode) {
      case 'recent':
        return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'az':
        return arr.sort((a, b) => a.title.localeCompare(b.title))
      case 'starred': {
        const starred = arr.filter(s => isStarred(s.id))
        const unstarred = arr.filter(s => !isStarred(s.id))
        return [...starred, ...unstarred]
      }
      default:
        return arr
    }
  }, [skits, isStarred, sortMode])

  const handleDelete = (id: string) => {
    if (SEED_IDS.has(id)) return
    if (!onDelete) return
    if (window.confirm('Delete this skit? This cannot be undone.')) {
      onDelete(id)
    }
  }

  return (
    <div className="mb-3">
      {/* Sort controls */}
      <div className="flex gap-1 mb-2">
        {([
          { mode: 'starred' as SortMode, label: '\u2B50 Starred' },
          { mode: 'recent' as SortMode, label: 'Recent' },
          { mode: 'az' as SortMode, label: 'A\u2013Z' },
        ]).map(sb => (
          <button
            key={sb.mode}
            onClick={() => setSortMode(sb.mode)}
            className={clsx(
              'px-2 py-0.5 rounded-md text-[10px] font-semibold cursor-pointer transition-colors border',
              sortMode === sb.mode
                ? 'bg-[var(--color-green-faded)] text-[var(--color-green-dark)] border-[var(--color-green-light)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-green-light)]',
            )}
          >
            {sb.label}
          </button>
        ))}
      </div>

      {/* Skit pills */}
      <div className="flex gap-1.5 flex-wrap">
        {sortedSkits.map(s => {
          const starred = isStarred(s.id)
          const active = currentId === s.id
          const isSeed = SEED_IDS.has(s.id)

          return (
            <div
              key={s.id}
              className={clsx(
                'group flex items-center rounded-xl transition-shadow relative',
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
                  'py-2 rounded-r-xl border-2 border-l-0 text-sm cursor-pointer transition-all',
                  // If deletable, no rounding on the right — the delete button rounds it
                  !isSeed && onDelete ? 'rounded-r-none px-2' : 'px-2.5',
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
              {/* Delete button — only for non-seed skits */}
              {!isSeed && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(s.id)
                  }}
                  className={clsx(
                    'px-1.5 py-2 rounded-r-xl border-2 border-l-0 text-[10px] cursor-pointer transition-all opacity-0 group-hover:opacity-60 hover:!opacity-100',
                    active
                      ? 'border-[var(--color-green-main)] bg-[var(--color-green-faded)] text-red-500'
                      : starred
                      ? 'border-[var(--color-pink-mid,#f48fb1)] bg-[var(--color-pink-faded,#fce4ec)] text-red-500'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-red-400',
                  )}
                  title="Delete skit"
                >
                  ✕
                </button>
              )}
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
    </div>
  )
}
