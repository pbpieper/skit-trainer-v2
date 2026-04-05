import { useState, useMemo, useEffect } from 'react'
import { useSkitContext } from '@/context/SkitContext'
import { useProgress } from '@/context/ProgressContext'
import { SciencePanel } from '@/components/molecules/SciencePanel'
import { colors } from '@/design/tokens'
import clsx from 'clsx'

interface Card {
  id: string | number
  label: string
  chunkNum: string
  palaceRef?: string
  hint?: string
  lines: Array<{ speaker: string; text: string }>
}

export function FlashcardMode() {
  const { chunks, flatLines, macroSections } = useSkitContext()
  const { progress, setProgress } = useProgress()
  const [granularity, setGranularity] = useState('meso')

  const cards = useMemo<Card[]>(() => {
    if (granularity === 'macro') return macroSections.filter(s => s.id !== 'all').map(s => ({
      id: s.id, label: s.label, chunkNum: `Chunks ${s.chunks.join(', ')}`,
      palaceRef: s.chunks.map(cid => chunks.find(c => c.id === cid)?.label).join(' | '),
      lines: flatLines.filter(l => s.chunks.includes(l.chunkId)),
    }))
    if (granularity === 'micro') return flatLines.map((l, i) => ({
      id: `micro_${i}`, label: `Line ${i + 1}`, chunkNum: `Chunk ${l.chunkId}: ${l.chunkLabel}`,
      hint: l.text.split(/\s+/).slice(0, 4).join(' ') + '...', lines: [l],
    }))
    return chunks.map(c => ({ id: c.id, label: c.label, chunkNum: `Chunk ${c.id}`, lines: c.lines }))
  }, [granularity, chunks, flatLines, macroSections])

  const [queue, setQueue] = useState<Card[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [round, setRound] = useState(1)
  const [wrong, setWrong] = useState<Card[]>([])
  const [done, setDone] = useState(false)

  const fcStats = progress.flashcardStats
  const setFcStats = (fn: (s: { correct: number; wrong: number }) => { correct: number; wrong: number }) =>
    setProgress(p => ({ ...p, flashcardStats: fn(p.flashcardStats) }))

  useEffect(() => {
    setQueue([...cards].sort(() => Math.random() - 0.5))
    setIdx(0); setFlipped(false); setRound(1); setWrong([]); setDone(false)
  }, [cards])

  const restart = () => {
    setQueue([...cards].sort(() => Math.random() - 0.5))
    setIdx(0); setFlipped(false); setRound(1); setWrong([]); setDone(false)
    setFcStats(() => ({ correct: 0, wrong: 0 }))
  }

  const rate = (correct: boolean) => {
    const newWrong = correct ? wrong : [...wrong, queue[idx]]
    setFcStats(s => ({ correct: s.correct + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }))
    if (idx + 1 >= queue.length) {
      if (newWrong.length === 0) setDone(true)
      else { setRound(r => r + 1); setQueue([...newWrong].sort(() => Math.random() - 0.5)); setIdx(0); setFlipped(false); setWrong([]) }
    } else { setIdx(idx + 1); setFlipped(false); setWrong(newWrong) }
  }

  const gLabels: Record<string, string> = { macro: 'Macro', meso: 'Meso', micro: 'Micro' }

  if (done) return (
    <div className="text-center py-10">
      <SciencePanel id="flashcard" />
      <div className="text-5xl mb-3">{"🎉"}</div>
      <h3 className="text-xl font-extrabold text-[var(--color-green-dark)] mb-2">All cards mastered!</h3>
      <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">{round} round{round > 1 ? 's' : ''} — {fcStats.correct} correct, {fcStats.wrong} retries</p>
      <button onClick={restart} className="px-6 py-2.5 rounded-xl border-none bg-[var(--color-green-main)] text-white text-sm font-bold cursor-pointer">Go Again</button>
    </div>
  )

  const card = queue[idx]
  if (!card) return null

  return (
    <div>
      <SciencePanel id="flashcard" />
      <div className="flex gap-1 mb-2.5">
        {['macro', 'meso', 'micro'].map(g => (
          <button key={g} onClick={() => setGranularity(g)}
            className={clsx('px-2.5 py-1 rounded-md border text-[11px] font-semibold cursor-pointer',
              granularity === g ? 'border-[var(--color-pink)] bg-[var(--color-pink-faded)] text-[var(--color-pink-dark)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]')}>
            {gLabels[g]}
          </button>
        ))}
      </div>
      <div className="flex gap-3.5 mb-3 text-xs text-[var(--color-text-secondary)]">
        <span>Round {round}</span><span>Card {idx + 1}/{queue.length}</span>
        <span className="font-bold" style={{ color: colors.correct }}>✓ {fcStats.correct}</span>
        <span className="font-bold" style={{ color: colors.incorrect }}>✗ {fcStats.wrong}</span>
      </div>
      {/* Progress pips */}
      <div className="flex gap-0.5 mb-3.5">
        {queue.map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-sm" style={{
            background: i < idx ? (wrong.some(w => w.id === queue[i].id) ? colors.incorrect : colors.correct) : i === idx ? colors.pink : colors.gray200
          }} />
        ))}
      </div>
      {/* Card */}
      <div onClick={() => !flipped && setFlipped(true)}
        className={clsx('min-h-[220px] rounded-2xl mb-3.5 overflow-hidden border-2 transition-all duration-300', flipped ? 'cursor-default' : 'cursor-pointer')}
        style={{ background: flipped ? 'var(--color-surface)' : `linear-gradient(135deg, ${colors.greenDark}, ${colors.greenMain})`, borderColor: flipped ? colors.pink : colors.greenDark }}>
        {!flipped ? (
          <div className="p-7 text-center flex flex-col justify-center min-h-[220px]">
            <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: colors.greenBright }}>{card.chunkNum}</p>
            <p className="text-[22px] font-extrabold text-white mb-2.5">{card.label}</p>
            {card.palaceRef && <p className="text-xs italic mb-1.5" style={{ color: colors.greenBright }}>{"🏛️"} {card.palaceRef?.slice(0, 80)}</p>}
            {granularity === 'micro' && card.hint && (
              <p className="text-[13px] mt-2 px-3.5 py-1.5 rounded-lg inline-block" style={{ color: colors.greenLight, background: 'rgba(255,255,255,0.1)' }}>"{card.hint}"</p>
            )}
            <p className="text-[11px] mt-4 opacity-60" style={{ color: colors.greenBright }}>Recite aloud, then click to flip</p>
          </div>
        ) : (
          <div className="p-5">
            <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: colors.pink }}>{card.label}</p>
            {card.lines.map((line, i) => (
              <p key={i} className="mb-1.5 leading-relaxed text-[13px]">
                <span className="font-bold text-xs" style={{ color: line.speaker === 'GUY' || line.speaker === 'PERFORMER' ? colors.greenDark : colors.pink }}>{line.speaker}:</span>{' '}{line.text}
              </p>
            ))}
          </div>
        )}
      </div>
      {flipped && (
        <div className="flex gap-2.5">
          <button onClick={() => rate(false)} className="flex-1 py-3.5 rounded-xl border-none text-sm font-bold cursor-pointer" style={{ background: '#FEE2E2', color: colors.incorrect }}>✗ Didn't know</button>
          <button onClick={() => rate(true)} className="flex-1 py-3.5 rounded-xl border-none text-sm font-bold cursor-pointer" style={{ background: colors.greenFaded, color: colors.correct }}>✓ Got it</button>
        </div>
      )}
    </div>
  )
}
