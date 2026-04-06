import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useSkitContext } from '@/context/SkitContext'
import { useGoal } from '@/context/GoalContext'
import { useTheme } from '@/design/theme'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSessionTracker } from '@/hooks/useSessionTracker'
import { METHODS } from '@/data/methods'
import { TabBar } from '@/components/molecules/TabBar'
import { SkitSwitcher } from '@/components/molecules/SkitSwitcher'
import { SkitImporter } from '@/components/molecules/SkitImporter'
import { GoalSetter } from '@/components/molecules/GoalSetter'
import { DailyTodos } from '@/components/molecules/DailyTodos'
import { StudyPlan } from '@/components/tools/StudyPlan'
import { ReadMode } from '@/components/tools/ReadMode'
import { FillMode } from '@/components/tools/FillMode'
import { FreeWriteMode } from '@/components/tools/FreeWriteMode'
import { FirstLetterMode } from '@/components/tools/FirstLetterMode'
import { ChunkMode } from '@/components/tools/ChunkMode'
import { FlashcardMode } from '@/components/tools/FlashcardMode'
import { CueMode } from '@/components/tools/CueMode'
import { RSVPMode } from '@/components/tools/RSVPMode'
import { ChainMode } from '@/components/tools/ChainMode'
import { RecallMode } from '@/components/tools/RecallMode'
import { LociMode } from '@/components/tools/LociMode'
import { PerformMode } from '@/components/tools/PerformMode'
import { EditorMode } from '@/components/tools/EditorMode'
import { MapView } from '@/components/tools/MapView'
import { FutureMode } from '@/components/tools/FutureMode'
import { Dashboard } from '@/components/tools/Dashboard'
import type { ToolId } from '@/types/tools'

function ToolContent({ toolId }: { toolId: ToolId }) {
  const { setActiveTool } = useApp()
  switch (toolId) {
    case 'read': return <ReadMode />
    case 'fill': return <FillMode />
    case 'freewrite': return <FreeWriteMode />
    case 'firstletter': return <FirstLetterMode />
    case 'chunk': return <ChunkMode />
    case 'flashcard': return <FlashcardMode />
    case 'cue': return <CueMode />
    case 'rsvp': return <RSVPMode />
    case 'chain': return <ChainMode />
    case 'recall': return <RecallMode />
    case 'loci': return <LociMode />
    case 'perform': return <PerformMode />
    case 'editor': return <EditorMode />
    case 'map': return <MapView onNavigate={id => setActiveTool(id)} />
    case 'future': return <FutureMode />
    case 'dashboard': return <Dashboard />
    default: return <p>Unknown tool</p>
  }
}

export function AppShell() {
  const { activeTool, setActiveTool, visited, currentSkitId, setCurrentSkitId, skitLibrary, refreshLibrary } = useApp()
  const { skitTitle, skitSubtitle } = useSkitContext()
  const { streak } = useGoal()
  const { isDark, toggle } = useTheme()
  const [importerOpen, setImporterOpen] = useState(false)

  useKeyboardShortcuts({ setActiveTool, skitLibrary, currentSkitId, setCurrentSkitId })
  useSessionTracker()

  const progress = (visited.size / METHODS.length) * 100

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', fontFamily: 'var(--font-sans)' }}>
      <div className="max-w-[800px] mx-auto px-4 py-5">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[22px] font-extrabold text-[var(--color-green-dark)] m-0">Skit Trainer</h1>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 mb-0">{skitSubtitle}</p>
            </div>
            <div className="flex gap-2 items-center">
              {streak && streak.currentStreak > 0 && (
                <span className="px-2 py-1 rounded-lg text-[11px] font-bold text-[var(--color-pink)]">
                  🔥 {streak.currentStreak}
                </span>
              )}
              <button onClick={() => setActiveTool('dashboard')}
                className="px-3 py-1.5 rounded-lg border text-xs cursor-pointer font-semibold"
                style={{
                  borderColor: activeTool === 'dashboard' ? 'var(--color-green-main)' : 'var(--color-border)',
                  background: activeTool === 'dashboard' ? 'var(--color-green-faded)' : 'var(--color-surface)',
                  color: activeTool === 'dashboard' ? 'var(--color-green-dark)' : 'var(--color-text-secondary)',
                }}>
                Progress
              </button>
              <button onClick={toggle}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs cursor-pointer text-[var(--color-text-secondary)]">
                {isDark ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-sm" style={{ background: 'var(--color-gray-200)' }}>
              <div className="h-1 rounded-sm transition-[width] duration-400" style={{ background: 'var(--color-green-main)', width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-[var(--color-text-secondary)]">{visited.size}/{METHODS.length}</span>
          </div>
        </div>

        {/* Skit Switcher */}
        {skitLibrary.length > 0 && (
          <SkitSwitcher
            skits={skitLibrary}
            currentId={currentSkitId}
            onSelect={setCurrentSkitId}
            onAddClick={() => setImporterOpen(true)}
          />
        )}

        {/* Goal Setter (only for starred skits) */}
        <GoalSetter />

        {/* Daily To-dos (when goal exists) */}
        <DailyTodos onNavigate={setActiveTool} />

        {/* Study Plan */}
        <StudyPlan onNavigate={setActiveTool} />

        {/* Tab Bar */}
        <TabBar active={activeTool} visited={visited} onSelect={setActiveTool} />

        {/* Tool Content — key forces remount on skit or tool change */}
        <div className="p-4.5 border border-[var(--color-border)] rounded-xl min-h-[300px]" style={{ background: 'var(--color-surface)' }}>
          <ToolContent key={`${currentSkitId}-${activeTool}`} toolId={activeTool} />
        </div>
      </div>

      {/* Importer Modal */}
      <SkitImporter open={importerOpen} onClose={() => setImporterOpen(false)} onCreated={refreshLibrary} />
    </div>
  )
}
