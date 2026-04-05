import { useState } from 'react'
import { colors } from '@/design/tokens'
import type { ToolId } from '@/types/tools'

interface StudyPlanProps {
  onNavigate: (toolId: ToolId) => void
}

const steps = [
  { time: 'Hour 1', title: 'Foundation', tasks: [
    { text: 'Read through full script 2x with emotion + stage directions', tool: 'read' as ToolId },
    { text: 'Walk Memory Palace — all 9 stops, 30s each vivid visualization', tool: 'loci' as ToolId },
    { text: 'RSVP at 150 WPM — let the word sequence imprint passively', tool: 'rsvp' as ToolId },
  ]},
  { time: 'Hour 2', title: 'Chunk Mastery', tasks: [
    { text: 'Chunk & Build: master chunks 1-5 individually (use sub-chunks for long passages)', tool: 'chunk' as ToolId },
    { text: 'Chain Practice: chain 1→2, then 1→3, then 1→4, then 1→5', tool: 'chain' as ToolId },
    { text: 'Flashcards: one full round to identify weak chunks', tool: 'flashcard' as ToolId },
  ]},
  { time: 'Hour 3', title: 'Deep Recall', tasks: [
    { text: 'Chunk & Build: master chunks 6-9', tool: 'chunk' as ToolId },
    { text: 'Fill the Blank at 30%, then 50%, then 70%, then 100%', tool: 'fill' as ToolId },
    { text: "Active Recall: full pass, aim for 7+ 'Nailed'", tool: 'recall' as ToolId },
  ]},
  { time: 'Hour 4', title: 'Performance Prep', tasks: [
    { text: 'Cue Lines as Guy — drill transitions between lines', tool: 'cue' as ToolId },
    { text: 'RSVP at 300+ WPM — build speed and fluency', tool: 'rsvp' as ToolId },
    { text: 'First Letters mode — decode the full skit from letter cues', tool: 'firstletter' as ToolId },
    { text: 'Perform: 3 full run-throughs with timer, standing up', tool: 'perform' as ToolId },
  ]},
  { time: 'Before bed', title: 'Consolidation', tasks: [
    { text: 'Memory Palace walkthrough (sleep consolidates spatial memory)', tool: 'loci' as ToolId },
    { text: 'One final Perform run-through', tool: 'perform' as ToolId },
  ]},
  { time: 'Morning of', title: 'Lock In', tasks: [
    { text: "First Letters once — quick confidence check", tool: 'firstletter' as ToolId },
    { text: "One cold Perform. You're ready.", tool: 'perform' as ToolId },
  ]},
]

export function StudyPlan({ onNavigate }: StudyPlanProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-3.5 rounded-xl border mb-4" style={{ background: colors.greenPale, borderColor: colors.greenBright }}>
      <button onClick={() => setOpen(!open)}
        className="bg-transparent border-none cursor-pointer flex items-center gap-2 w-full p-0">
        <span className="text-sm font-bold" style={{ color: colors.greenDark }}>{'📋'} 1-Day Study Plan</span>
        <span className="text-xs" style={{ color: colors.greenMain }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="mt-3.5">
          {steps.map((step, si) => (
            <div key={si} className="mb-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white" style={{ background: colors.pink }}>{step.time}</span>
                <span className="text-[13px] font-bold" style={{ color: colors.greenDark }}>{step.title}</span>
              </div>
              {step.tasks.map((task, ti) => (
                <div key={ti} className="flex items-start gap-2 mb-1 ml-3">
                  <span className="mt-0.5" style={{ color: colors.greenMain }}>{'•'}</span>
                  <span className="text-xs leading-relaxed flex-1" style={{ color: colors.gray700 }}>{task.text}</span>
                  <button onClick={() => onNavigate(task.tool)}
                    className="px-2 py-0.5 rounded-md border text-[10px] font-semibold cursor-pointer whitespace-nowrap shrink-0"
                    style={{ borderColor: colors.greenLight, background: colors.white, color: colors.greenMain }}>
                    Open →
                  </button>
                </div>
              ))}
            </div>
          ))}
          <div className="mt-2.5 p-2.5 bg-white rounded-lg text-[11px]" style={{ color: colors.greenDark }}>
            <strong>Tips:</strong> Speak aloud (motor memory). Pace while reciting. Exaggerate emotions and gestures — it's a performance piece. Sleep consolidates, so final reps before bed are crucial.
          </div>
        </div>
      )}
    </div>
  )
}
