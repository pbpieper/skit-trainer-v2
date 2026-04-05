import { colors } from '@/design/tokens'

interface Feature {
  title: string
  desc: string
  status: 'planned' | 'in_progress' | 'idea'
  priority: 'high' | 'medium' | 'low'
  icon: string
}

const features: Feature[] = [
  { title: 'Library System', desc: 'Support multiple texts — skits, poems, speeches, monologues. Switch between them with all tools auto-configured.', status: 'planned', priority: 'high', icon: '📚' },
  { title: 'Internal AI Editor', desc: 'Upload raw text and have AI automatically parse it into chunks, identify speakers, generate anchors and visuals, and configure all learning tools.', status: 'planned', priority: 'high', icon: '🤖' },
  { title: 'Audio / Read-Aloud', desc: 'Text-to-speech integration for hearing the skit performed. Option for different voices per character.', status: 'planned', priority: 'medium', icon: '🔊' },
  { title: 'Recording & Playback', desc: 'Record your performances in Perform mode. Store multiple takes. Compare timing and delivery across attempts.', status: 'planned', priority: 'medium', icon: '🎙️' },
  { title: 'Memory Palace Images', desc: 'AI-generated or user-uploaded images for each Palace stop. Richer spatial-visual associations.', status: 'in_progress', priority: 'medium', icon: '🖼️' },
  { title: 'Spaced Repetition Scheduler', desc: 'Long-term retention scheduling based on Ebbinghaus forgetting curve.', status: 'planned', priority: 'medium', icon: '📅' },
  { title: 'Progress Analytics', desc: 'Dashboard tracking mastery across all tools. Heat map of weak spots. Session history.', status: 'planned', priority: 'low', icon: '📊' },
  { title: 'Collaborative Mode', desc: 'Practice with a partner remotely. One plays A, one plays B.', status: 'idea', priority: 'low', icon: '👥' },
  { title: 'Mobile-Optimized', desc: 'Touch-friendly interface. Offline mode. Practice on the go.', status: 'idea', priority: 'low', icon: '📱' },
  { title: 'Cross-Piece Personalization', desc: "User preferences for chunk size, difficulty, and repetition frequency persist across all pieces in the library. Learn once how you learn best — the platform adapts to your style everywhere.", status: 'idea', priority: 'high', icon: '⚙️' },
  { title: 'Home Dashboard', desc: "A home screen managing multiple study sessions/projects. Daily to-do tasks generated from spaced repetition schedules, weekly goals, long-term milestones. One place to see everything you're learning and what needs attention today.", status: 'idea', priority: 'high', icon: '🏠' },
  { title: 'AI Tutor / Good Buddy', desc: 'Conversational AI that learns your personality, vocabulary, and goals. Feels like a human study partner. Builds a learner profile over time to tailor difficulty, pacing, and encouragement. Gamification and tricks to develop optimal strategies.', status: 'idea', priority: 'high', icon: '🤝' },
  { title: 'Design Thinking Pipeline', desc: 'User-first discovery: forget implementation, picture ideal experience. Walk-throughs for test subjects, mockups simulating functionality. Penalty-free brainstorming before realism. 2010 design thinking applied to AI thinking.', status: 'idea', priority: 'high', icon: '💡' },
  { title: 'LEGO Architecture', desc: 'Hybrid bottom-up/top-down: vision of the full house, build brick-by-brick. Each tool independently useful and shareable. Identify existing open-source LEGOs (Duolingo, Whispr, n8n). Focus on one applicable brick at a time.', status: 'idea', priority: 'high', icon: '🧱' },
  { title: 'Knowledge Modeling', desc: "Model user's current knowledge base to determine exact difficulty level. 80% familiar / 20% new content filter. Word cloud + Venn diagram for optimal learning paths. Cultural and language variance awareness.", status: 'idea', priority: 'high', icon: '🧬' },
  { title: 'Exportable Ecosystem', desc: 'Individual tools, combos, and plans as shareable packages. Galaxy/House visual metaphor. Solar systems = combos, planets = tools. Friends import configurations.', status: 'in_progress', priority: 'high', icon: '📤' },
  { title: 'Open-Source Integration', desc: "Survey existing bricks: Duolingo (gamification), Whispr (audio), n8n (serverless). Don't just integrate — solve new problems. Focus on gaps that create unique value.", status: 'idea', priority: 'medium', icon: '🔗' },
]

const statusColors: Record<string, string> = { planned: colors.greenMain, in_progress: colors.pink, idea: colors.gray400 }
const statusLabels: Record<string, string> = { planned: 'Planned', in_progress: 'In Progress', idea: 'Idea' }
const priorityColors: Record<string, string> = { high: colors.pink, medium: '#D97706', low: colors.gray400 }

export function FutureMode() {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-base font-extrabold m-0 mb-1" style={{ color: colors.greenDark }}>Future Iterations</h3>
        <p className="text-xs m-0" style={{ color: colors.gray500 }}>Tracking planned enhancements and ideas for the platform.</p>
      </div>
      {features.map((f, i) => (
        <div key={i} className="p-3.5 mb-2 rounded-[10px] border bg-white" style={{ borderColor: colors.gray200 }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{f.icon}</span>
            <span className="text-sm font-bold flex-1" style={{ color: colors.gray900 }}>{f.title}</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
              style={{ background: `${statusColors[f.status]}15`, color: statusColors[f.status], borderColor: `${statusColors[f.status]}30` }}>
              {statusLabels[f.status]}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
              style={{ background: `${priorityColors[f.priority]}15`, color: priorityColors[f.priority] }}>
              {f.priority}
            </span>
          </div>
          <p className="text-xs leading-relaxed m-0" style={{ color: colors.gray600 }}>{f.desc}</p>
        </div>
      ))}
      <div className="mt-3.5 p-3 rounded-[10px] border text-xs" style={{ background: colors.greenPale, borderColor: colors.greenBright, color: colors.greenDark }}>
        <strong>Vision:</strong> A universal memorization platform that takes any text and provides a full suite of evidence-based learning tools, personalized to your progress and learning style.
      </div>
    </div>
  )
}
