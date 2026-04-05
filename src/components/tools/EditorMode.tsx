import { useState } from 'react'
import { useSkitContext } from '@/context/SkitContext'
import { colors } from '@/design/tokens'

export function EditorMode() {
  const { chunks } = useSkitContext()
  const [text, setText] = useState(() =>
    chunks.map(c => c.lines.map(l => `${l.speaker}: ${l.text}`).join('\n')).join('\n\n')
  )
  const [copied, setCopied] = useState(false)

  return (
    <div>
      <p className="text-[13px] text-[var(--color-gray-500)] mb-3">
        Edit the script text here. In future versions, changes will propagate to all tools automatically.
      </p>
      <textarea value={text} onChange={e => setText(e.target.value)}
        className="w-full min-h-[400px] p-3.5 rounded-[10px] border-2 text-[13px] font-mono resize-y outline-none leading-[1.8]"
        style={{ borderColor: colors.greenLight }} />
      <div className="flex gap-2 mt-2.5">
        <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="px-5 py-2 rounded-[10px] border-none text-[13px] font-semibold cursor-pointer text-white"
          style={{ background: colors.greenMain }}>
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
        <button onClick={() => setText(chunks.map(c => c.lines.map(l => `${l.speaker}: ${l.text}`).join('\n')).join('\n\n'))}
          className="px-5 py-2 rounded-[10px] border-none text-[13px] font-semibold cursor-pointer"
          style={{ background: colors.gray200, color: colors.gray700 }}>
          Reset to original
        </button>
      </div>
      <div className="mt-3.5 p-3 rounded-[10px] border text-xs" style={{ background: colors.pinkFaded, borderColor: `${colors.pinkMid}30`, color: colors.pinkDark }}>
        <strong>Coming soon:</strong> Upload any text, and the platform will auto-generate all tools fitted to your content.
      </div>
    </div>
  )
}
