import { METHODS } from '@/data/methods'
import type { ToolId } from '@/types/tools'
import clsx from 'clsx'

interface Props {
  active: ToolId
  visited: Set<ToolId>
  onSelect: (id: ToolId) => void
}

export function TabBar({ active, visited, onSelect }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1.5 mb-1">
      {METHODS.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={clsx(
            'shrink-0 px-2.5 py-1.5 rounded-lg border-none text-xs font-semibold cursor-pointer transition-all duration-150',
            active === m.id
              ? m.id === 'future'
                ? 'bg-[var(--color-pink)] text-white shadow-md'
                : 'bg-[var(--color-green-main)] text-white shadow-md'
              : visited.has(m.id)
                ? 'bg-[var(--color-green-faded)] text-[var(--color-green-dark)] hover:bg-[var(--color-green-bright)]'
                : 'bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-200)]'
          )}
        >
          {m.icon} {m.label}
        </button>
      ))}
    </div>
  )
}
