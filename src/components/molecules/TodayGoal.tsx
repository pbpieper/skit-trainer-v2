import { useApp } from '@/context/AppContext'
import { useSkitContext } from '@/context/SkitContext'
import { STUDY_STEPS, PHASES, loadGuideProgress, getDayNumber, getTodaySteps } from '@/components/tools/StudyGuide'
import type { ToolId } from '@/types/tools'

export function TodayGoal() {
  const { setActiveTool } = useApp()
  const { skitId } = useSkitContext()

  const day = getDayNumber(skitId)
  const { startStep, endStep, label } = getTodaySteps(day)
  const guideProgress = loadGuideProgress(skitId)
  const todaySteps = STUDY_STEPS.filter(s => s.step >= startStep && s.step <= endStep)
  const nextStep = todaySteps.find(s => !guideProgress[s.step]) || todaySteps[0]
  const todayDone = todaySteps.filter(s => guideProgress[s.step]).length
  const allDone = nextStep ? !!guideProgress[nextStep.step] : true

  return (
    <div className="flex items-center gap-2.5 flex-wrap rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 mb-3">
      <span className="text-base">📅</span>
      <div className="flex-1 min-w-[140px]">
        <div className="text-xs font-bold text-emerald-900">
          Day {day}: {label}
        </div>
        <div className="text-[11px] text-gray-500">
          {!allDone
            ? `Step ${nextStep!.step} — ${nextStep!.title}`
            : 'All steps done for today!'}
          <span className="ml-1.5 opacity-70">({todayDone}/{todaySteps.length} done)</span>
        </div>
      </div>
      {!allDone && nextStep && (
        <button
          onClick={() => setActiveTool(nextStep.tool as ToolId)}
          className="px-3.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold
                     hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          Start
        </button>
      )}
    </div>
  )
}
