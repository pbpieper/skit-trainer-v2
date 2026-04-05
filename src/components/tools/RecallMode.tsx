import { useState } from 'react'
import { useSkitContext } from '@/context/SkitContext'
import { useProgress } from '@/context/ProgressContext'
import { SciencePanel } from '@/components/molecules/SciencePanel'
import { colors } from '@/design/tokens'

type ScoreVal = 'got' | 'close' | 'miss'

export function RecallMode() {
  const { chunks } = useSkitContext()
  const { progress, setProgress } = useProgress()
  const [idx, setIdx] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const scores = progress.recallScores as Record<number, ScoreVal>

  const c = chunks[idx]
  const scoredAll = chunks.every(ch => scores[ch.id])
  const scoreIt = (val: ScoreVal) => {
    setProgress(p => ({ ...p, recallScores: { ...p.recallScores, [c.id]: val } }))
    setShowAnswer(false)
    if (idx < chunks.length - 1) setIdx(idx + 1)
  }
  const nav = (dir: number) => { setIdx(Math.max(0, Math.min(chunks.length - 1, idx + dir))); setShowAnswer(false) }
  const restart = () => { setIdx(0); setProgress(p => ({ ...p, recallScores: {} })); setShowAnswer(false) }

  const counts = { got: 0, close: 0, miss: 0 }
  Object.values(scores).forEach(v => { if (v in counts) counts[v as ScoreVal]++ })

  return (
    <div>
      <SciencePanel id="recall" />
      {/* Score bar */}
      <div className="flex gap-0.5 mb-2.5">
        {chunks.map((ch, i) => (
          <div key={ch.id} onClick={() => { setIdx(i); setShowAnswer(false) }}
            className="h-2 flex-1 rounded cursor-pointer transition-all duration-200"
            style={{
              background: scores[ch.id] === 'got' ? colors.correct : scores[ch.id] === 'close' ? '#D97706' : scores[ch.id] === 'miss' ? colors.incorrect : i === idx ? colors.pink : colors.gray200,
              transform: i === idx ? 'scaleY(1.5)' : 'scaleY(1)',
            }} />
        ))}
      </div>
      <div className="flex gap-3.5 mb-3 text-xs text-[var(--color-text-secondary)]">
        <span style={{ color: colors.correct }} className="font-bold">{"💪"} {counts.got}</span>
        <span style={{ color: '#D97706' }} className="font-bold">{"🤏"} {counts.close}</span>
        <span style={{ color: colors.incorrect }} className="font-bold">{"😬"} {counts.miss}</span>
        <span>{Object.keys(scores).length}/{chunks.length} scored</span>
      </div>
      {/* Nav */}
      <div className="flex gap-2 items-center justify-center mb-3.5">
        <button onClick={() => nav(-1)} disabled={idx === 0} className="px-4 py-1.5 rounded-lg border-none bg-[var(--color-gray-100)] text-[var(--color-gray-600)] text-[13px] font-semibold cursor-pointer disabled:opacity-40">← Back</button>
        <span className="text-[13px] text-[var(--color-text-secondary)] min-w-[80px] text-center">Chunk {idx + 1}/{chunks.length}</span>
        <button onClick={() => nav(1)} disabled={idx >= chunks.length - 1} className="px-4 py-1.5 rounded-lg border-none bg-[var(--color-gray-100)] text-[var(--color-gray-600)] text-[13px] font-semibold cursor-pointer disabled:opacity-40">Next →</button>
      </div>
      {/* Chunk prompt */}
      <div className="text-center p-5 bg-[var(--color-surface-alt)] rounded-xl mb-3">
        <p className="text-xl font-extrabold text-[var(--color-green-dark)] mb-1.5">{c.label}</p>
        {scores[c.id] && (
          <div className="mt-2 px-3 py-1 rounded-lg inline-block text-xs font-semibold"
            style={{
              background: scores[c.id] === 'got' ? colors.greenFaded : scores[c.id] === 'close' ? '#FEF3C7' : '#FEE2E2',
              color: scores[c.id] === 'got' ? colors.correct : scores[c.id] === 'close' ? '#92400E' : colors.incorrect,
            }}>
            Previously: {scores[c.id] === 'got' ? '💪 Nailed' : scores[c.id] === 'close' ? '🤏 Close' : '😬 Missed'}
          </div>
        )}
      </div>
      {!showAnswer ? (
        <div className="text-center">
          <p className="text-xs text-[var(--color-text-muted)] mb-2.5">Say it out loud, then reveal ↓</p>
          <button onClick={() => setShowAnswer(true)} className="px-6 py-2.5 rounded-xl border-none bg-[var(--color-gray-900)] text-white text-sm font-bold cursor-pointer">Reveal</button>
        </div>
      ) : (
        <div>
          <div className="bg-[var(--color-surface)] rounded-xl p-3.5 mb-3 border border-[var(--color-border)]">
            {c.lines.map((line, i) => (
              <p key={i} className="mb-1 leading-relaxed text-[13px]">
                <span className="font-bold text-[11px]" style={{ color: line.speaker === 'GUY' || line.speaker === 'PERFORMER' ? colors.greenDark : colors.pink }}>{line.speaker}:</span>{' '}{line.text}
              </p>
            ))}
          </div>
          <div className="flex gap-2 justify-center">
            <button onClick={() => scoreIt('miss')} className="px-4.5 py-2.5 rounded-xl border-none text-[13px] font-bold cursor-pointer" style={{ background: '#FEE2E2', color: colors.incorrect }}>{"😬"} Missed</button>
            <button onClick={() => scoreIt('close')} className="px-4.5 py-2.5 rounded-xl border-none text-[13px] font-bold cursor-pointer" style={{ background: '#FEF3C7', color: '#92400E' }}>{"🤏"} Close</button>
            <button onClick={() => scoreIt('got')} className="px-4.5 py-2.5 rounded-xl border-none text-[13px] font-bold cursor-pointer" style={{ background: colors.greenFaded, color: colors.correct }}>{"💪"} Nailed</button>
          </div>
        </div>
      )}
      {scoredAll && (
        <div className="text-center mt-4 p-4 bg-[var(--color-green-faded)] rounded-xl">
          <p className="text-base font-bold text-[var(--color-green-dark)] mb-2">Round complete!</p>
          <p className="text-xs text-[var(--color-text-secondary)] mb-2.5">Nailed: {counts.got} | Close: {counts.close} | Missed: {counts.miss}</p>
          <button onClick={restart} className="px-6 py-2.5 rounded-xl border-none bg-[var(--color-green-main)] text-white text-sm font-bold cursor-pointer">Go Again</button>
        </div>
      )}
    </div>
  )
}
