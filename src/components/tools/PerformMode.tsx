import { useState, useEffect, useRef } from 'react'
import { useSkitContext } from '@/context/SkitContext'
import { useCreativeHub } from '@/hooks/useCreativeHub'
import { SciencePanel } from '@/components/molecules/SciencePanel'
import { colors } from '@/design/tokens'
import toast from 'react-hot-toast'

export function PerformMode() {
  const { flatLines, skitTitle } = useSkitContext()
  const { available, generateAudio } = useCreativeHub()
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [showScript, setShowScript] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [ambientUrl, setAmbientUrl] = useState<string | null>(null)
  const [loadingAmbient, setLoadingAmbient] = useState(false)
  const ambientRef = useRef<HTMLAudioElement | null>(null)

  const handleAmbient = async () => {
    if (ambientRef.current) { ambientRef.current.pause(); ambientRef.current = null; setAmbientUrl(null); return }
    setLoadingAmbient(true)
    try {
      const url = await generateAudio(`Soft ambient background music for a stage performance rehearsal of "${skitTitle}". Gentle, focused, minimal, no lyrics`, 30)
      setAmbientUrl(url)
      const audio = new Audio(url)
      audio.loop = true
      audio.volume = 0.3
      ambientRef.current = audio
      audio.play()
      toast.success('Ambient audio playing')
    } catch {
      toast.error('Audio generation failed')
    } finally {
      setLoadingAmbient(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => () => { ambientRef.current?.pause() }, [])

  useEffect(() => {
    if (running) intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    else if (intervalRef.current) clearInterval(intervalRef.current)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div>
      <SciencePanel id="perform" />
      <div className="flex items-center gap-3.5 mb-3.5">
        <button onClick={() => setRunning(!running)}
          className="px-6 py-3 rounded-xl border-none text-[15px] font-bold cursor-pointer text-white"
          style={{ background: running ? colors.pink : colors.greenMain }}>
          {running ? '⏸ Pause' : elapsed > 0 ? '▶ Resume' : '▶ Start'}
        </button>
        <button onClick={() => { setRunning(false); setElapsed(0) }}
          className="px-4.5 py-3 rounded-xl border-none bg-[var(--color-gray-200)] text-[var(--color-gray-700)] text-sm font-semibold cursor-pointer">Reset</button>
        <span className="text-[28px] font-mono font-bold text-[var(--color-green-dark)]">{fmt(elapsed)}</span>
        {available && (
          <button onClick={handleAmbient} disabled={loadingAmbient}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[11px] font-semibold cursor-pointer disabled:opacity-50"
            style={{ background: ambientUrl ? colors.pinkFaded : colors.gray100, color: ambientUrl ? colors.pinkDark : colors.gray600 }}>
            {loadingAmbient ? 'Generating...' : ambientUrl ? '🔇 Stop Music' : '🎵 Ambient'}
          </button>
        )}
      </div>
      <button onClick={() => setShowScript(!showScript)}
        className="px-4.5 py-2 rounded-xl border-none text-[13px] font-semibold cursor-pointer mb-3"
        style={{ background: showScript ? colors.pink : colors.gray100, color: showScript ? colors.white : colors.gray600 }}>
        {showScript ? 'Hide Script' : 'Peek'}
      </button>
      {showScript ? (
        <div className="p-3.5 bg-[var(--color-surface-alt)] rounded-xl max-h-[400px] overflow-y-auto">
          {flatLines.map((line, i) => (
            <p key={i} className="mb-1 text-[13px]">
              <span className="font-bold text-[11px]" style={{ color: line.speaker === 'GUY' || line.speaker === 'PERFORMER' ? colors.greenDark : colors.pink }}>{line.speaker}:</span>{' '}{line.text}
            </p>
          ))}
        </div>
      ) : running ? (
        <div className="p-12 rounded-2xl text-center" style={{ background: colors.gray900 }}>
          <p className="text-white text-lg font-semibold">You're on stage.</p>
          <p className="text-[var(--color-gray-400)] text-[13px] mt-2">Perform from memory. Stand up. Use gestures.</p>
        </div>
      ) : null}
      <div className="mt-3.5 p-3 rounded-xl border text-xs" style={{ background: colors.pinkFaded, borderColor: `${colors.pinkMid}30`, color: colors.pinkDark }}>
        <strong>Future:</strong> Record your performances to playback and compare across attempts.
      </div>
    </div>
  )
}
