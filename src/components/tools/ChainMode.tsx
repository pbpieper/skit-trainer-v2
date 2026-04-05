import { useState } from 'react'
import { useSkitContext } from '@/context/SkitContext'
import { useProgress } from '@/context/ProgressContext'
import { SciencePanel } from '@/components/molecules/SciencePanel'
import { colors } from '@/design/tokens'
import clsx from 'clsx'

export function ChainMode() {
  const { chunks } = useSkitContext()
  const { progress, setProgress } = useProgress()
  const [upTo, setUpTo] = useState(2)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const completed = progress.chainCompleted

  const markComplete = () => {
    setProgress(p => { const n = new Set(p.chainCompleted); n.add(upTo); return { ...p, chainCompleted: n } })
    if (upTo < chunks.length) { setUpTo(upTo + 1); setRevealed(new Set()) }
  }

  return (
    <div>
      <SciencePanel id="chain" />
      <div className="mb-3.5">
        <div className="flex gap-2 items-center mb-2.5">
          <span className="text-xs text-[var(--color-text-secondary)]">Chain 1 →</span>
          <div className="flex gap-1">
            {chunks.map((c, i) => (
              <button key={c.id} onClick={() => { setUpTo(i + 1); setRevealed(new Set()) }}
                className="w-[30px] h-[30px] rounded-lg border-2 text-[11px] font-bold cursor-pointer flex items-center justify-center"
                style={{
                  borderColor: i + 1 === upTo ? colors.pink : completed.has(i + 1) ? colors.correct : colors.gray200,
                  background: i + 1 === upTo ? colors.pink : completed.has(i + 1) ? colors.greenFaded : i + 1 <= upTo ? colors.gray50 : colors.white,
                  color: i + 1 === upTo ? colors.white : completed.has(i + 1) ? colors.greenDark : colors.gray500,
                }}>
                {completed.has(i + 1) ? '✓' : c.id}
              </button>
            ))}
          </div>
        </div>
        <input type="range" min={1} max={chunks.length} value={upTo} onChange={e => { setUpTo(Number(e.target.value)); setRevealed(new Set()) }}
          className="w-full" style={{ accentColor: colors.pink }} />
      </div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs text-[var(--color-text-secondary)] m-0">Recite chunks 1–{upTo} from memory. Click to peek.</p>
        <button onClick={markComplete} className="px-3.5 py-1.5 rounded-lg border-none bg-[var(--color-green-main)] text-white text-xs font-semibold cursor-pointer">
          Done — Add next →
        </button>
      </div>
      {chunks.slice(0, upTo).map(c => {
        const isRevealed = revealed.has(c.id)
        return (
          <div key={c.id} onClick={() => { const n = new Set(revealed); isRevealed ? n.delete(c.id) : n.add(c.id); setRevealed(n) }}
            className={clsx('rounded-xl border p-3 cursor-pointer mb-1.5 transition-all duration-150',
              isRevealed ? 'border-[var(--color-pink)] bg-[var(--color-pink-faded)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)]')}>
            <div className="flex justify-between mb-0.5">
              <span className="text-[13px] font-bold text-[var(--color-gray-700)]">{c.id}. {c.label}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">{isRevealed ? 'hide' : 'peek'}</span>
            </div>
            {isRevealed && (
              <div className="mt-2 border-t border-[var(--color-pink-mid)]/20 pt-2">
                {c.lines.map((line, i) => (
                  <p key={i} className="mb-0.5 text-[13px] leading-relaxed">
                    <span className="font-bold text-[11px]" style={{ color: line.speaker === 'GUY' || line.speaker === 'PERFORMER' ? colors.greenDark : colors.pink }}>{line.speaker}:</span>{' '}{line.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        )
      })}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1 bg-[var(--color-gray-200)] rounded-full">
          <div className="h-1 bg-[var(--color-green-main)] rounded-full transition-[width] duration-300" style={{ width: `${(completed.size / chunks.length) * 100}%` }} />
        </div>
        <span className="text-[11px] text-[var(--color-text-secondary)]">{completed.size}/{chunks.length} chains</span>
      </div>
    </div>
  )
}
