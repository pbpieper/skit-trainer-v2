import type { MacroSection, Chunk } from '@/types/skit'

interface Props {
  value: string
  onChange: (v: string) => void
  macroSections: MacroSection[]
  chunks: Chunk[]
}

export function SectionSelect({ value, onChange, macroSections, chunks }: Props) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-2.5 py-1.5 rounded-lg border-2 border-[var(--color-green-light)] text-[13px] bg-[var(--color-surface)] text-[var(--color-gray-700)]"
    >
      {macroSections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
      <optgroup label="Individual Chunks">
        {chunks.map(c => <option key={`c${c.id}`} value={`c${c.id}`}>{c.id}. {c.label}</option>)}
      </optgroup>
    </select>
  )
}
