import { useState, useRef } from 'react'
import { useSkitContext } from '@/context/SkitContext'
import { useCreativeHub } from '@/hooks/useCreativeHub'
import { SciencePanel } from '@/components/molecules/SciencePanel'
import toast from 'react-hot-toast'

export function ReadMode() {
  const { chunks } = useSkitContext()
  const { available, speak } = useCreativeHub()
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [speaking, setSpeaking] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleSpeak = async (key: string, text: string) => {
    if (speaking === key) {
      audioRef.current?.pause()
      setSpeaking(null)
      return
    }
    setSpeaking(key)
    try {
      const url = await speak(text)
      if (audioRef.current) audioRef.current.pause()
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setSpeaking(null)
      audio.play()
    } catch {
      toast.error('TTS unavailable')
      setSpeaking(null)
    }
  }

  const toggle = (key: string) => {
    setRevealed(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div>
      <SciencePanel id="read" />
      {chunks.map(chunk => (
        <div key={chunk.id} className="mb-4 p-3 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
          <p className="text-[11px] font-bold text-[var(--color-green-main)] mb-2">
            {chunk.id}. {chunk.label}
          </p>
          {chunk.lines.map((line, li) => {
            const anchorKey = `${chunk.id}-${li}-anchor`
            const visualKey = `${chunk.id}-${li}-visual`
            return (
              <div key={li} className="mb-2">
                <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed">
                  <span className="font-bold text-[var(--color-pink)]">{line.speaker}: </span>
                  {line.text}
                </p>
                {available && (
                  <button
                    onClick={() => handleSpeak(`${chunk.id}-${li}`, `${line.speaker}: ${line.text}`)}
                    className="text-[10px] mt-1 mr-2 px-2 py-0.5 rounded-md border border-[var(--color-gray-300)] bg-[var(--color-gray-100)] text-[var(--color-gray-600)] cursor-pointer"
                  >
                    {speaking === `${chunk.id}-${li}` ? '⏹ Stop' : '🔊 Hear'}
                  </button>
                )}
                {line.anchor && (
                  <button
                    onClick={() => toggle(anchorKey)}
                    className="text-[10px] mt-1 mr-2 px-2 py-0.5 rounded-md border border-[var(--color-green-light)] bg-[var(--color-green-faded)] text-[var(--color-green-dark)] cursor-pointer"
                  >
                    {revealed.has(anchorKey) ? `🔗 ${line.anchor}` : '🔗 Anchor'}
                  </button>
                )}
                {line.visual && (
                  <button
                    onClick={() => toggle(visualKey)}
                    className="text-[10px] mt-1 px-2 py-0.5 rounded-md border border-[var(--color-pink-mid)] bg-[var(--color-pink-faded)] text-[var(--color-pink-dark)] cursor-pointer"
                  >
                    {revealed.has(visualKey) ? `🎬 ${line.visual}` : '🎬 Visual'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
