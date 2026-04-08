import { useState } from 'react'
import { TOOL_CATEGORIES } from '@/data/methods'
import type { ToolId } from '@/types/tools'
import clsx from 'clsx'

interface Props {
  active: ToolId
  visited: Set<ToolId>
  onSelect: (id: ToolId) => void
}

export function TabBar({ active, visited, onSelect }: Props) {
  const [expandedCat, setExpandedCat] = useState<string | null>(() => {
    // Start with the category that contains the active tool expanded
    const cat = TOOL_CATEGORIES.find(c => c.tools.some(t => t.id === active))
    return cat?.id ?? null
  })

  // Find which category the active tool belongs to
  const activeCatId = TOOL_CATEGORIES.find(c => c.tools.some(t => t.id === active))?.id

  return (
    <div className="mb-1.5">
      {/* Category row */}
      <div className="flex gap-1 mb-1 overflow-x-auto pb-0.5">
        {TOOL_CATEGORIES.map(cat => {
          const isActiveCat = activeCatId === cat.id
          const isExpanded = expandedCat === cat.id
          const hasVisited = cat.tools.some(t => visited.has(t.id))

          return (
            <button
              key={cat.id}
              onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
              className={clsx(
                'shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-150 border',
                isActiveCat
                  ? 'bg-[var(--color-green-main)] text-white border-[var(--color-green-main)] shadow-sm'
                  : isExpanded
                  ? 'bg-[var(--color-green-faded)] text-[var(--color-green-dark)] border-[var(--color-green-light)]'
                  : hasVisited
                  ? 'bg-[var(--color-green-faded)] text-[var(--color-green-dark)] border-transparent hover:border-[var(--color-green-light)]'
                  : 'bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] border-transparent hover:bg-[var(--color-gray-200)]',
              )}
            >
              {cat.icon} {cat.label}
            </button>
          )
        })}
      </div>

      {/* Expanded tool row */}
      {expandedCat && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {TOOL_CATEGORIES.find(c => c.id === expandedCat)?.tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => onSelect(tool.id)}
              className={clsx(
                'shrink-0 px-2.5 py-1.5 rounded-lg border-none text-xs font-semibold cursor-pointer transition-all duration-150',
                active === tool.id
                  ? 'bg-[var(--color-green-main)] text-white shadow-md'
                  : visited.has(tool.id)
                  ? 'bg-[var(--color-green-faded)] text-[var(--color-green-dark)] hover:bg-[var(--color-green-bright)]'
                  : 'bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-200)]',
              )}
            >
              {tool.icon} {tool.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
