import type { Skit } from '@/types/skit'
import type { SkitProgress } from '@/types/progress'
import type { DifficultyPlan, PlanCategory, DailyTask } from '@/types/goals'
import type { ToolId } from '@/types/tools'
import { v4 as uuid } from 'uuid'

const CATEGORIES: PlanCategory[] = [
  {
    name: 'foundation',
    label: 'Foundation',
    description: 'First exposure — read, visualize, imprint',
    tools: ['read', 'loci', 'rsvp'],
  },
  {
    name: 'retrieval',
    label: 'Retrieval',
    description: 'Active recall — chunk, fill, test',
    tools: ['chunk', 'fill', 'freewrite', 'flashcard'],
  },
  {
    name: 'integration',
    label: 'Integration',
    description: 'Link everything — chain, cue, recall',
    tools: ['chain', 'cue', 'recall'],
  },
  {
    name: 'transfer',
    label: 'Transfer',
    description: 'Stage-ready — perform, first letters, speed',
    tools: ['perform', 'firstletter', 'rsvp'],
  },
]

const TASK_TEMPLATES: Record<string, { title: string; description: string }[]> = {
  read: [
    { title: 'Read full script', description: 'Read through with emotion and stage directions' },
    { title: 'Deep read', description: 'Focus on meaning, motivation, and subtext of each line' },
  ],
  loci: [
    { title: 'Walk Memory Palace', description: 'Visualize each stop for 30 seconds' },
    { title: 'Palace speed run', description: 'Quick walk-through to reinforce spatial anchors' },
  ],
  rsvp: [
    { title: 'RSVP slow pass', description: 'Read at 150 WPM to imprint word sequence' },
    { title: 'RSVP speed build', description: 'Increase to 300+ WPM for fluency' },
  ],
  chunk: [
    { title: 'Master chunks', description: 'Work through chunks individually until solid' },
    { title: 'Sub-chunk drill', description: 'Break long chunks into sub-chunks and master each' },
  ],
  fill: [
    { title: 'Fill 30%', description: 'Warm up with low blank percentage' },
    { title: 'Fill 60%', description: 'Challenge yourself with more blanks' },
    { title: 'Fill 100%', description: 'Full recall — no words shown' },
  ],
  freewrite: [
    { title: 'Free write section', description: 'Write from memory, then compare to original' },
  ],
  flashcard: [
    { title: 'Flashcard round', description: 'Full deck to identify weak spots' },
  ],
  chain: [
    { title: 'Chain build', description: 'Build progressive chain: 1→2, 1→3, 1→4...' },
    { title: 'Full chain', description: 'Run the complete chain without breaks' },
  ],
  cue: [
    { title: 'Cue line practice', description: 'Respond to cue lines from memory' },
  ],
  recall: [
    { title: 'Active recall', description: 'Full pass — aim for all chunks nailed' },
  ],
  perform: [
    { title: 'Full performance', description: 'Stand up, use gestures, time yourself' },
    { title: 'Cold performance', description: 'No warm-up — test true readiness' },
  ],
  firstletter: [
    { title: 'First letter decode', description: 'Reconstruct from first-letter cues' },
  ],
}

/**
 * Generate a difficulty plan given a skit, target date, and current progress.
 * Distributes tasks across days with escalating difficulty.
 */
export function generatePlan(skit: Skit, targetDate: string, progress: SkitProgress): DifficultyPlan {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(targetDate + 'T00:00:00')
  const totalDays = Math.max(1, Math.ceil((target.getTime() - today.getTime()) / 86400000))

  return {
    categories: CATEGORIES,
    totalDays,
  }
}

/**
 * Generate concrete daily tasks for a specific date within a learning goal.
 * Earlier days focus on foundation, later days on transfer.
 */
export function generateDailyTasks(
  goalId: string,
  userId: string,
  skit: Skit,
  targetDate: string,
  date: string,
  progress: SkitProgress,
): DailyTask[] {
  const today = new Date(date + 'T00:00:00')
  const target = new Date(targetDate + 'T00:00:00')
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const totalDays = Math.max(1, Math.ceil((target.getTime() - start.getTime()) / 86400000))
  const dayIndex = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / 86400000))
  const progressRatio = totalDays > 1 ? dayIndex / (totalDays - 1) : 1

  // Determine how many tasks per category based on where we are in the timeline
  // Early: heavy foundation. Late: heavy transfer.
  const weights = getCategoryWeights(progressRatio)
  const tasks: DailyTask[] = []
  const chunkCount = skit.chunks.length
  const masteredCount = progress.chunkMastered.size

  for (const cat of CATEGORIES) {
    const taskCount = weights[cat.name]
    if (taskCount === 0) continue

    const catTools = cat.tools
    for (let i = 0; i < taskCount; i++) {
      const toolId = catTools[i % catTools.length]
      const templates = TASK_TEMPLATES[toolId] ?? [{ title: `Practice ${toolId}`, description: '' }]
      const template = templates[Math.min(i, templates.length - 1)]

      // Difficulty scales with progress ratio and category
      const baseDifficulty = { foundation: 1, retrieval: 2, integration: 3, transfer: 4 }[cat.name]
      const difficulty = Math.min(5, baseDifficulty + Math.floor(progressRatio * 2))

      const task: DailyTask = {
        id: uuid(),
        goalId,
        userId,
        skitId: skit.id,
        date,
        category: cat.name,
        toolId: toolId as ToolId,
        title: template.title,
        description: contextualizeDescription(template.description, chunkCount, masteredCount, progressRatio),
        difficulty,
        dependsOn: [],
        unlocks: [],
        completedAt: null,
        createdAt: new Date().toISOString(),
      }
      tasks.push(task)
    }
  }

  // Wire up dependencies: foundation tasks unlock retrieval, retrieval unlocks integration, etc.
  const byCategory = new Map<string, DailyTask[]>()
  for (const t of tasks) {
    const list = byCategory.get(t.category) ?? []
    list.push(t)
    byCategory.set(t.category, list)
  }

  const catOrder: PlanCategory['name'][] = ['foundation', 'retrieval', 'integration', 'transfer']
  for (let c = 1; c < catOrder.length; c++) {
    const prevTasks = byCategory.get(catOrder[c - 1]) ?? []
    const currTasks = byCategory.get(catOrder[c]) ?? []
    if (prevTasks.length > 0 && currTasks.length > 0) {
      // Current category tasks depend on all previous category tasks
      const prevIds = prevTasks.map(t => t.id)
      for (const t of currTasks) {
        t.dependsOn = prevIds
      }
      // Previous tasks unlock current tasks
      const currIds = currTasks.map(t => t.id)
      for (const t of prevTasks) {
        t.unlocks = currIds
      }
    }
  }

  return tasks
}

function getCategoryWeights(progressRatio: number): Record<PlanCategory['name'], number> {
  // progressRatio: 0 = first day, 1 = last day
  if (progressRatio < 0.25) {
    return { foundation: 3, retrieval: 1, integration: 0, transfer: 0 }
  } else if (progressRatio < 0.5) {
    return { foundation: 1, retrieval: 3, integration: 1, transfer: 0 }
  } else if (progressRatio < 0.75) {
    return { foundation: 0, retrieval: 1, integration: 3, transfer: 1 }
  } else {
    return { foundation: 0, retrieval: 0, integration: 1, transfer: 3 }
  }
}

function contextualizeDescription(desc: string, chunkCount: number, masteredCount: number, progressRatio: number): string {
  if (chunkCount > 0 && desc.includes('chunks')) {
    const remaining = chunkCount - masteredCount
    return `${desc} (${remaining} of ${chunkCount} remaining)`
  }
  return desc
}
