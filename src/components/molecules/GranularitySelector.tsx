import type { MacroSection, MesoSection, MicroSection } from '@/types/skit'
import clsx from 'clsx'

type Granularity = 'macro' | 'meso' | 'micro'

interface Props {
  granularity: Granularity
  setGranularity: (g: Granularity) => void
  section: string
  setSection: (s: string) => void
  macroSections: MacroSection[]
  mesoSections: MesoSection[]
  microSections: MicroSection[]
}

const G_LABELS: Record<Granularity, string> = { macro: 'Macro (Sections)', meso: 'Meso (Chunks)', micro: 'Micro (Lines)' }
const G_DEFAULTS: Record<Granularity, string> = { macro: 'all', meso: 'meso_1', micro: 'micro_0' }

export function GranularitySelector({ granularity, setGranularity, section, setSection, macroSections, mesoSections, microSections }: Props) {
  const levels: Granularity[] = ['macro', 'meso', 'micro']
  const options = granularity === 'macro' ? macroSections : granularity === 'meso' ? mesoSections : microSections

  return (
    <div className="mb-3">
      <div className="flex gap-1 mb-2">
        {levels.map(g => (
          <button
            key={g}
            onClick={() => { setGranularity(g); setSection(G_DEFAULTS[g]) }}
            className={clsx(
              'px-3 py-1.5 rounded-lg border-2 text-[11px] font-bold cursor-pointer transition-colors',
              granularity === g
                ? g === 'micro'
                  ? 'border-[var(--color-pink)] bg-[var(--color-pink-faded)] text-[var(--color-pink)]'
                  : g === 'macro'
                    ? 'border-[var(--color-green-dark)] bg-[var(--color-green-faded)] text-[var(--color-green-dark)]'
                    : 'border-[var(--color-green-main)] bg-[var(--color-green-faded)] text-[var(--color-green-main)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
            )}
          >
            {G_LABELS[g]}
          </button>
        ))}
      </div>
      <select
        value={section}
        onChange={e => setSection(e.target.value)}
        className="px-2.5 py-1.5 rounded-lg border-2 border-[var(--color-green-light)] text-xs bg-[var(--color-surface)] text-[var(--color-gray-700)] max-w-full"
      >
        {options.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    </div>
  )
}
