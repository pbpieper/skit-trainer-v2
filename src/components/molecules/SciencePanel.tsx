import { useState } from 'react'
import { SCIENCE } from '@/data/methods'
import type { ToolId } from '@/types/tools'

export function SciencePanel({ id }: { id: ToolId }) {
  const [open, setOpen] = useState(false)
  const s = SCIENCE[id]
  if (!s) return null

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
      >
        <span className="text-xs font-semibold text-[var(--color-green-main)]">
          {"📚"} {s.name}
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)]">({s.researcher})</span>
        <span className="text-[10px] text-[var(--color-text-muted)]">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="mt-2 p-3.5 bg-[var(--color-green-pale)] rounded-xl border border-[var(--color-green-bright)] text-[13px] leading-relaxed">
          <p className="mb-2">
            <strong className="text-[var(--color-green-dark)]">What:</strong>{' '}
            <span className="text-[var(--color-gray-700)]">{s.what}</span>
          </p>
          <p className="mb-2">
            <strong className="text-[var(--color-green-dark)]">How to use:</strong>{' '}
            <span className="text-[var(--color-gray-700)]">{s.how}</span>
          </p>
          <p className="m-0">
            <strong className="text-[var(--color-green-dark)]">When:</strong>{' '}
            <span className="text-[var(--color-gray-700)]">{s.when}</span>
          </p>
        </div>
      )}
    </div>
  )
}
