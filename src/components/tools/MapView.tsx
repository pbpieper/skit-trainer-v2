import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { METHODS, TOOL_COMBOS, exportConfig } from '@/data/methods'
import { colors } from '@/design/tokens'
import type { ToolId } from '@/types/tools'

interface MapViewProps {
  onNavigate: (toolId: ToolId) => void
}

export function MapView({ onNavigate }: MapViewProps) {
  const { visited } = useApp()
  const [metaphor, setMetaphor] = useState<'galaxy' | 'house'>('galaxy')
  const [copied, setCopied] = useState<string | null>(null)

  const handleExport = (type: string, id: string) => {
    const json = exportConfig(type, id)
    navigator.clipboard?.writeText(json)
    setCopied(`${type}:${id}`)
    setTimeout(() => setCopied(null), 2000)
  }

  const ml = metaphor === 'galaxy'
    ? { systemIcon: '☀️' }
    : { systemIcon: '🚪' }

  const isDark = metaphor === 'galaxy'

  return (
    <div>
      <div className="flex justify-between items-center mb-3.5">
        <div>
          <h3 className="text-base font-extrabold m-0" style={{ color: isDark ? colors.white : colors.greenDark }}>
            {metaphor === 'galaxy' ? '🌌 Galaxy Map' : '🏠 House Map'}
          </h3>
          <p className="text-[11px] mt-0.5 mb-0" style={{ color: isDark ? colors.gray400 : colors.gray500 }}>
            {metaphor === 'galaxy' ? 'Tools orbit as planets in solar systems. Click to launch. Share to export.' : 'Tools are bricks in rooms. Click to enter. Share to export.'}
          </p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setMetaphor('galaxy')}
            className="px-2.5 py-1 rounded-md border text-[11px] font-semibold cursor-pointer"
            style={{ borderColor: metaphor === 'galaxy' ? colors.pink : colors.gray300, background: metaphor === 'galaxy' ? colors.pink : 'transparent', color: metaphor === 'galaxy' ? colors.white : colors.gray500 }}>
            {'🌌'} Galaxy
          </button>
          <button onClick={() => setMetaphor('house')}
            className="px-2.5 py-1 rounded-md border text-[11px] font-semibold cursor-pointer"
            style={{ borderColor: metaphor === 'house' ? colors.greenMain : colors.gray300, background: metaphor === 'house' ? colors.greenMain : 'transparent', color: metaphor === 'house' ? colors.white : colors.gray500 }}>
            {'🏠'} House
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => handleExport('plan', 'full')}
          className="px-3.5 py-1.5 rounded-lg border border-dashed bg-transparent text-[11px] font-semibold cursor-pointer"
          style={{ borderColor: colors.pink, color: colors.pink }}>
          {copied === 'plan:full' ? '✓ Copied!' : '📤 Export Full Plan'}
        </button>
      </div>

      {TOOL_COMBOS.map(combo => (
        <div key={combo.id} className="mb-4 p-4 rounded-[14px] border"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : colors.gray50,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.gray200,
          }}>
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">{ml.systemIcon}</span>
              <div>
                <p className="text-[13px] font-bold m-0" style={{ color: isDark ? colors.white : colors.greenDark }}>{combo.label}</p>
                <p className="text-[11px] m-0" style={{ color: isDark ? colors.gray400 : colors.gray500 }}>{combo.desc}</p>
              </div>
            </div>
            <button onClick={() => handleExport('combo', combo.id)}
              className="px-2.5 py-0.5 rounded-md border bg-transparent text-[10px] font-semibold cursor-pointer"
              style={{ borderColor: isDark ? `${colors.pink}60` : colors.pink, color: colors.pink }}>
              {copied === `combo:${combo.id}` ? '✓' : '📤 Share'}
            </button>
          </div>

          <div className="flex flex-wrap" style={{ gap: metaphor === 'galaxy' ? 10 : 6 }}>
            {combo.tools.map(tid => {
              const m = METHODS.find(m => m.id === tid)
              if (!m) return null
              const isVisited = visited.has(tid)

              if (metaphor === 'galaxy') {
                return (
                  <div key={tid} className="flex flex-col items-center gap-1">
                    <button onClick={() => onNavigate(tid as ToolId)}
                      className="w-[52px] h-[52px] rounded-full border-none cursor-pointer text-xl flex items-center justify-center transition-all duration-200"
                      style={{
                        background: isVisited ? `radial-gradient(circle, ${colors.greenBright}, ${colors.greenMain})` : 'radial-gradient(circle, #334155, #1E293B)',
                        boxShadow: isVisited ? `0 0 12px ${colors.greenMain}60` : '0 0 8px rgba(0,0,0,0.3)',
                      }}>
                      {m.icon}
                    </button>
                    <span className="text-[9px] font-semibold text-center" style={{ color: isDark ? colors.gray400 : colors.gray500 }}>{m.label}</span>
                    <button onClick={() => handleExport('tool', tid)}
                      className="px-1.5 py-px rounded border-none bg-transparent text-[8px] cursor-pointer"
                      style={{ color: isDark ? colors.gray500 : colors.gray400 }}>
                      {copied === `tool:${tid}` ? '✓' : 'share'}
                    </button>
                  </div>
                )
              } else {
                return (
                  <button key={tid} onClick={() => onNavigate(tid as ToolId)}
                    className="px-3 py-2 rounded-md border-2 text-[11px] font-semibold cursor-pointer flex items-center gap-1.5 transition-all duration-150"
                    style={{
                      borderColor: isVisited ? colors.greenMain : colors.gray200,
                      background: isVisited ? colors.greenFaded : colors.white,
                      color: isVisited ? colors.greenDark : colors.gray500,
                      boxShadow: isVisited ? `0 2px 4px ${colors.greenMain}20` : '0 1px 2px rgba(0,0,0,0.05)',
                    }}>
                    <span className="text-base">{m.icon}</span>
                    <span>{m.label}</span>
                    <span onClick={e => { e.stopPropagation(); handleExport('tool', tid) }}
                      className="text-[8px] ml-1 cursor-pointer" style={{ color: colors.gray400 }}>
                      {copied === `tool:${tid}` ? '✓' : '📤'}
                    </span>
                  </button>
                )
              }
            })}
          </div>

          {metaphor === 'galaxy' && (
            <div className="mt-1.5 h-0.5 rounded-sm" style={{ background: `linear-gradient(90deg, transparent, ${colors.greenMain}30, transparent)` }} />
          )}
        </div>
      ))}

      <div className="p-3 rounded-[10px] border border-dashed"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : colors.gray50,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.gray200,
        }}>
        <p className="text-[11px] font-semibold m-0 mb-2" style={{ color: isDark ? colors.gray500 : colors.gray400 }}>
          {metaphor === 'galaxy' ? '🌑 Utility Moons' : '🔧 Utility Closet'}
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {METHODS.filter(m => !TOOL_COMBOS.some(c => c.tools.includes(m.id))).map(m => (
            <button key={m.id} onClick={() => onNavigate(m.id)}
              className="px-2.5 py-1 rounded-md border text-[10px] font-medium cursor-pointer flex items-center gap-1"
              style={{
                borderColor: colors.gray200,
                background: visited.has(m.id) ? colors.greenFaded : colors.white,
                color: visited.has(m.id) ? colors.greenDark : colors.gray500,
              }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
