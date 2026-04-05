import { useState } from 'react'
import { useSkitContext } from '@/context/SkitContext'
import { useCreativeHub } from '@/hooks/useCreativeHub'
import { SciencePanel } from '@/components/molecules/SciencePanel'
import { colors } from '@/design/tokens'
import clsx from 'clsx'
import toast from 'react-hot-toast'

interface PalaceStop {
  scene: string
  imageUrl: string
  anchor: string
  phrases: string[]
  selectedPhrases: string[]
  prompt: string
}

export function LociMode() {
  const { chunks, palaceImages } = useSkitContext()
  const { available, generateImage } = useCreativeHub()
  const [stop, setStop] = useState(0)
  const [showText, setShowText] = useState(false)
  const [imgError, setImgError] = useState<Set<number>>(new Set())
  const [view, setView] = useState<'walk' | 'build'>('walk')
  const [generating, setGenerating] = useState<Set<number>>(new Set())

  const [custom, setCustom] = useState<Record<number, PalaceStop>>(() => {
    const init: Record<number, PalaceStop> = {}
    chunks.forEach((c, i) => {
      const allText = c.lines.map(l => l.text).join(' ')
      const sentences = allText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [allText]
      const phrases = sentences.map(s => s.trim()).filter(s => s.split(/\s+/).length > 2)
      init[i] = {
        scene: '',
        imageUrl: palaceImages[i] || '',
        anchor: '',
        phrases,
        selectedPhrases: phrases.slice(0, Math.min(2, phrases.length)),
        prompt: '',
      }
    })
    return init
  })

  const updateCustom = (stopIdx: number, field: keyof PalaceStop, val: string | string[]) => {
    setCustom(prev => ({ ...prev, [stopIdx]: { ...prev[stopIdx], [field]: val } }))
  }

  const handleGenerateImage = async (stopIdx: number) => {
    const s = custom[stopIdx]
    const sceneDesc = s.scene || `${chunks[stopIdx].label}: ${s.selectedPhrases.slice(0, 2).join('. ')}`
    if (!sceneDesc.trim()) { toast.error('Add a scene description first'); return }
    setGenerating(prev => new Set(prev).add(stopIdx))
    try {
      const prompt = `Memory palace scene: ${sceneDesc}. Vivid, dreamlike, highly memorable, surreal details, warm lighting, wide angle`
      const url = await generateImage(prompt, { width: 1024, height: 576 })
      updateCustom(stopIdx, 'imageUrl', url)
      setImgError(prev => { const n = new Set(prev); n.delete(stopIdx); return n })
      toast.success(`Image generated for stop ${stopIdx + 1}`)
    } catch (err) {
      toast.error(`Image failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setGenerating(prev => { const n = new Set(prev); n.delete(stopIdx); return n })
    }
  }

  const togglePhrase = (stopIdx: number, phrase: string) => {
    setCustom(prev => {
      const cur = prev[stopIdx].selectedPhrases
      const next = cur.includes(phrase) ? cur.filter(p => p !== phrase) : [...cur, phrase]
      return { ...prev, [stopIdx]: { ...prev[stopIdx], selectedPhrases: next } }
    })
  }

  const c = chunks[stop]
  const pal = custom[stop]

  if (view === 'build') {
    return (
      <div>
        <SciencePanel id="loci" />
        <div className="flex gap-2 mb-3.5">
          <button onClick={() => setView('walk')} className="px-3.5 py-1.5 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-gray-600)] text-xs font-semibold cursor-pointer">{"🚶"} Walk Palace</button>
          <button className="px-3.5 py-1.5 rounded-lg border-2 border-[var(--color-pink)] bg-[var(--color-pink-faded)] text-[var(--color-pink-dark)] text-xs font-bold cursor-pointer">{"🔨"} Build Palace</button>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mb-3.5 leading-relaxed">Make each stop yours. Edit the scene, pick your trigger phrases, add images.</p>
        <div className="flex gap-1 flex-wrap mb-3.5">
          {chunks.map((ch, i) => (
            <button key={i} onClick={() => setStop(i)}
              className={clsx('px-2.5 py-1.5 rounded-lg border-2 text-[11px] font-semibold cursor-pointer',
                i === stop ? 'border-[var(--color-pink)] bg-[var(--color-pink-faded)] text-[var(--color-pink-dark)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]')}>
              {ch.id}. {ch.label}
            </button>
          ))}
        </div>
        <div className="p-4.5 bg-[var(--color-surface-alt)] rounded-xl border border-[var(--color-border)]">
          <h4 className="text-sm font-bold text-[var(--color-green-dark)] mb-3.5">Stop {stop + 1}: {c.label}</h4>
          <div className="mb-3.5">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Scene — what do you see?</label>
            <textarea value={pal.scene} onChange={e => updateCustom(stop, 'scene', e.target.value)}
              placeholder="Describe your vivid scene..."
              className="w-full min-h-[60px] mt-1 p-2.5 rounded-lg border border-[var(--color-green-light)] text-[13px] resize-y outline-none leading-relaxed" style={{ fontFamily: 'inherit' }} />
          </div>
          <div className="mb-3.5">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Scene Image</label>
            <div className="flex gap-2 mt-1">
              <input type="text" value={pal.imageUrl} onChange={e => { updateCustom(stop, 'imageUrl', e.target.value); setImgError(p => { const n = new Set(p); n.delete(stop); return n }) }}
                placeholder="https://... or generate below" className="flex-1 p-2 rounded-lg border border-[var(--color-green-light)] text-xs outline-none" />
              {available && (
                <button onClick={() => handleGenerateImage(stop)} disabled={generating.has(stop)}
                  className="px-3 py-1.5 rounded-lg border-none text-[11px] font-bold cursor-pointer text-white disabled:opacity-50"
                  style={{ background: generating.has(stop) ? colors.gray400 : colors.greenMain }}>
                  {generating.has(stop) ? 'Generating...' : 'AI Generate'}
                </button>
              )}
            </div>
            {pal.imageUrl && !imgError.has(stop) && (
              <div className="mt-1.5 rounded-lg overflow-hidden h-[100px]">
                <img src={pal.imageUrl} alt="preview" onError={() => setImgError(p => { const n = new Set(p); n.add(stop); return n })} className="w-full h-full object-cover opacity-80" />
              </div>
            )}
          </div>
          <div className="mb-3.5">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Anchor — your shorthand</label>
            <input type="text" value={pal.anchor} onChange={e => updateCustom(stop, 'anchor', e.target.value)}
              className="w-full mt-1 p-2 rounded-lg border border-[var(--color-green-light)] text-[13px] outline-none" />
          </div>
          <div className="mb-3.5">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Key Phrases</label>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 mb-1.5">Click to select/deselect.</p>
            <div className="flex flex-col gap-1">
              {pal.phrases.map((phrase, pi) => {
                const sel = pal.selectedPhrases.includes(phrase)
                return (
                  <button key={pi} onClick={() => togglePhrase(stop, phrase)}
                    className={clsx('text-left px-2.5 py-1.5 rounded-lg border text-xs leading-relaxed cursor-pointer transition-all',
                      sel ? 'border-[var(--color-green-main)] bg-[var(--color-green-faded)] text-[var(--color-green-dark)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]')}>
                    {sel ? '✓ ' : ''}{phrase.length > 80 ? phrase.slice(0, 80) + '...' : phrase}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="mb-1.5">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Your Memory Prompt</label>
            <textarea value={pal.prompt} onChange={e => updateCustom(stop, 'prompt', e.target.value)}
              placeholder="e.g. 'I imagine my uncle doing this at Thanksgiving'"
              className="w-full min-h-[50px] mt-1 p-2.5 rounded-lg border text-[13px] resize-y outline-none leading-relaxed"
              style={{ fontFamily: 'inherit', borderColor: `${colors.pinkMid}50`, background: `${colors.pinkFaded}60` }} />
          </div>
        </div>
        <div className="flex justify-between items-center mt-3.5">
          <button onClick={() => setStop(Math.max(0, stop - 1))} disabled={stop === 0} className="px-3.5 py-1.5 rounded-lg border-none bg-[var(--color-gray-100)] text-[var(--color-gray-600)] text-[13px] cursor-pointer disabled:opacity-40">← Prev</button>
          <span className="text-xs text-[var(--color-text-muted)]">{stop + 1} / {chunks.length}</span>
          <button onClick={() => setStop(Math.min(chunks.length - 1, stop + 1))} disabled={stop >= chunks.length - 1} className="px-3.5 py-1.5 rounded-lg border-none bg-[var(--color-gray-100)] text-[var(--color-gray-600)] text-[13px] cursor-pointer disabled:opacity-40">Next →</button>
        </div>
      </div>
    )
  }

  // WALK VIEW
  return (
    <div>
      <SciencePanel id="loci" />
      <div className="flex gap-2 mb-3.5">
        <button className="px-3.5 py-1.5 rounded-lg border-2 border-[var(--color-green-main)] bg-[var(--color-green-faded)] text-[var(--color-green-dark)] text-xs font-bold cursor-pointer">{"🚶"} Walk Palace</button>
        <button onClick={() => setView('build')} className="px-3.5 py-1.5 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-gray-600)] text-xs font-semibold cursor-pointer">{"🔨"} Build Palace</button>
      </div>
      <div className="flex items-center gap-3 mb-3.5">
        <button onClick={() => { setStop(Math.max(0, stop - 1)); setShowText(false) }} disabled={stop === 0} className="px-3 py-1.5 rounded-lg border-none bg-[var(--color-gray-100)] text-sm cursor-pointer disabled:opacity-40">←</button>
        <span className="text-[13px] text-[var(--color-text-secondary)]">Stop {stop + 1} / {chunks.length}</span>
        <button onClick={() => { setStop(Math.min(chunks.length - 1, stop + 1)); setShowText(false) }} disabled={stop === chunks.length - 1} className="px-3 py-1.5 rounded-lg border-none bg-[var(--color-gray-100)] text-sm cursor-pointer disabled:opacity-40">→</button>
      </div>
      <div className="p-6 rounded-2xl border border-[var(--color-green-bright)]" style={{ background: `linear-gradient(135deg, ${colors.greenPale}, ${colors.pinkFaded})` }}>
        {pal.imageUrl && !imgError.has(stop) && (
          <div className="mb-3.5 rounded-xl overflow-hidden h-[140px]">
            <img src={pal.imageUrl} alt={c.label} onError={() => setImgError(p => { const n = new Set(p); n.add(stop); return n })} className="w-full h-full object-cover opacity-80" />
          </div>
        )}
        <div className="text-center mb-3.5">
          <span className="text-[32px]">{"🏛️"}</span>
          <p className="text-[11px] uppercase tracking-widest mt-1" style={{ color: colors.greenMain }}>Stop {stop + 1}: {c.label}</p>
        </div>
        {pal.scene && (
          <div className="p-3.5 rounded-xl mb-2.5" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <p className="text-xs font-bold text-[var(--color-green-dark)] mb-1">Visualize:</p>
            <p className="text-[var(--color-gray-700)] leading-relaxed m-0">{pal.scene}</p>
          </div>
        )}
        {pal.anchor && (
          <div className="p-2.5 rounded-xl mb-2.5" style={{ background: 'rgba(255,255,255,0.5)' }}>
            <p className="text-xs font-bold text-[var(--color-text-secondary)] mb-0.5">Anchor:</p>
            <p className="text-[var(--color-gray-700)] m-0">{pal.anchor}</p>
          </div>
        )}
        {pal.selectedPhrases.length > 0 && (
          <div className="p-2.5 rounded-xl mb-2.5" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <p className="text-xs font-bold mb-1.5" style={{ color: colors.pink }}>Key Phrases:</p>
            {pal.selectedPhrases.map((phrase, pi) => (
              <p key={pi} className="text-xs leading-relaxed mb-0.5 pl-2 border-l-2" style={{ color: colors.gray700, borderColor: colors.pink }}>
                "{phrase.length > 90 ? phrase.slice(0, 90) + '...' : phrase}"
              </p>
            ))}
          </div>
        )}
        {pal.prompt && (
          <div className="p-2.5 rounded-xl mb-2.5 border-l-[3px]" style={{ background: `${colors.pinkFaded}80`, borderColor: colors.pink }}>
            <p className="text-[11px] font-bold mb-0.5" style={{ color: colors.pinkDark }}>Your Memory Prompt:</p>
            <p className="text-[var(--color-gray-700)] leading-relaxed m-0 italic text-[13px]">{pal.prompt}</p>
          </div>
        )}
        <div className="text-center">
          <button onClick={() => setShowText(!showText)} className="px-4.5 py-2 rounded-xl border-none bg-[var(--color-green-main)] text-white text-[13px] font-semibold cursor-pointer">
            {showText ? 'Hide' : 'Show Lines'}
          </button>
        </div>
        {showText && (
          <div className="mt-2.5 p-3 bg-white rounded-xl">
            {c.lines.map((line, i) => (
              <p key={i} className="mb-1 leading-relaxed">
                <span className="font-bold text-xs" style={{ color: line.speaker === 'GUY' || line.speaker === 'PERFORMER' ? colors.greenDark : colors.pink }}>{line.speaker}:</span>{' '}{line.text}
              </p>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-0.5 justify-center mt-3.5">
        {chunks.map((_, i) => (
          <button key={i} onClick={() => { setStop(i); setShowText(false) }}
            className="w-[22px] h-[22px] rounded-full border-none text-[9px] font-bold cursor-pointer transition-transform"
            style={{
              background: i === stop ? colors.greenMain : colors.gray200,
              color: i === stop ? colors.white : colors.gray500,
              transform: i === stop ? 'scale(1.2)' : 'scale(1)',
            }}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
