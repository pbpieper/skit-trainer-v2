import type { LadderLevel } from '@/types/ladder'

/**
 * The 10-Level Memorization Ladder
 *
 * Levels span across categories (foundation → retrieval → integration → transfer → mastery).
 * Lower levels progress quickly; upper levels incorporate spaced repetition.
 * Each level mixes tools from relevant categories.
 *
 * Level 1-2:  Foundation — quick exposure, spatial anchoring
 * Level 3:    Bridge — chunking meets first recall
 * Level 4-5:  Retrieval — active testing, chain building
 * Level 6:    Integration — connecting everything
 * Level 7-8:  Transfer — speed, fluency, proof of knowledge
 * Level 9:    Performance — by heart, on stage
 * Level 10:   Mastery — spaced repetition confirms true retention
 */
export const LADDER_LEVELS: readonly LadderLevel[] = [
  {
    id: 1,
    name: 'First Contact',
    subtitle: 'Exposure & Imprint',
    categories: 'foundation',
    tasks: [
      { toolId: 'read', title: 'Read full script', description: 'Read through with emotion and stage directions' },
      { toolId: 'rsvp', title: 'RSVP slow pass', description: '150 WPM to imprint word sequence' },
    ],
    challenge: {
      type: 'recall',
      title: 'Recognize the Flow',
      description: 'Identify the correct order of 5 random chunks from the script',
      threshold: 60,
      metric: 'ordering accuracy',
    },
    timeEstimate: '~15 min',
  },
  {
    id: 2,
    name: 'Mental Map',
    subtitle: 'Spatial Anchoring',
    categories: 'foundation',
    tasks: [
      { toolId: 'loci', title: 'Walk Memory Palace', description: 'Visualize each stop for 30 seconds' },
      { toolId: 'read', title: 'Deep read', description: 'Focus on meaning, motivation, subtext' },
      { toolId: 'rsvp', title: 'RSVP build to 200', description: 'Slightly faster — building fluency' },
    ],
    challenge: {
      type: 'loci',
      title: 'Palace Walk',
      description: 'Name the location for 4 out of 6 random chunks',
      threshold: 65,
      metric: 'spatial recall',
    },
    timeEstimate: '~20 min',
  },
  {
    id: 3,
    name: 'Breakdown',
    subtitle: 'Chunking & Drilling',
    categories: 'foundation + retrieval',
    tasks: [
      { toolId: 'chunk', title: 'Master chunks', description: 'Work through chunks individually' },
      { toolId: 'chunk', title: 'Sub-chunk drill', description: 'Break long chunks into pieces' },
      { toolId: 'fill', title: 'Fill 30%', description: 'Warm up — low blank percentage' },
    ],
    challenge: {
      type: 'fill',
      title: 'Gap Check',
      description: 'Complete a fill-the-gap test at 40% blanks',
      threshold: 70,
      metric: 'fill accuracy',
    },
    timeEstimate: '~25 min',
  },
  {
    id: 4,
    name: 'Active Recall',
    subtitle: 'Testing Your Memory',
    categories: 'retrieval',
    tasks: [
      { toolId: 'fill', title: 'Fill 50%', description: 'Half the words missing — real test' },
      { toolId: 'flashcard', title: 'Flashcard round', description: 'Full deck to ID weak spots' },
      { toolId: 'freewrite', title: 'Free write section', description: 'Write from memory, then compare' },
    ],
    challenge: {
      type: 'fill',
      title: 'Recall Gate',
      description: 'Fill-the-gap at 60% blanks with 75% accuracy',
      threshold: 75,
      metric: 'fill accuracy',
    },
    timeEstimate: '~30 min',
  },
  {
    id: 5,
    name: 'Chain Building',
    subtitle: 'Linking It Together',
    categories: 'retrieval + integration',
    tasks: [
      { toolId: 'chain', title: 'Chain build', description: 'Progressive: 1→2, 1→3, 1→4...' },
      { toolId: 'cue', title: 'Cue line practice', description: 'Respond to cue lines from memory' },
      { toolId: 'fill', title: 'Fill 70%', description: 'Pushing harder on recall' },
    ],
    challenge: {
      type: 'chain',
      title: 'Chain Test',
      description: 'Complete a chain of 6+ sections without breaking',
      threshold: 75,
      metric: 'chain completion',
    },
    timeEstimate: '~30 min',
  },
  {
    id: 6,
    name: 'Deep Integration',
    subtitle: 'Full Connections',
    categories: 'integration',
    tasks: [
      { toolId: 'chain', title: 'Full chain', description: 'Run complete chain without breaks' },
      { toolId: 'recall', title: 'Active recall', description: 'Full pass — aim for all chunks' },
      { toolId: 'cue', title: 'Rapid cue response', description: 'Quick-fire cue line responses' },
    ],
    challenge: {
      type: 'recall',
      title: 'Integration Check',
      description: 'Active recall with 80% chunk accuracy',
      threshold: 80,
      metric: 'recall accuracy',
    },
    timeEstimate: '~35 min',
  },
  {
    id: 7,
    name: 'Fluency',
    subtitle: 'Speed & Confidence',
    categories: 'integration + transfer',
    tasks: [
      { toolId: 'rsvp', title: 'RSVP speed build', description: '300+ WPM — fluency test' },
      { toolId: 'firstletter', title: 'First letter decode', description: 'Reconstruct from first letters' },
      { toolId: 'fill', title: 'Fill 90%', description: 'Near-total recall from minimal cues' },
    ],
    challenge: {
      type: 'firstletter',
      title: 'Fluency Gate',
      description: 'First-letter reconstruction at 85% accuracy',
      threshold: 85,
      metric: 'reconstruction accuracy',
    },
    timeEstimate: '~30 min',
  },
  {
    id: 8,
    name: 'You Know It',
    subtitle: 'Proven Knowledge',
    categories: 'transfer',
    tasks: [
      { toolId: 'fill', title: 'Fill 100%', description: 'Full recall — no words shown' },
      { toolId: 'recall', title: 'Cold recall', description: 'No warm-up, straight from memory' },
      { toolId: 'perform', title: 'First performance', description: 'Stand up, use gestures, try it' },
    ],
    challenge: {
      type: 'perform',
      title: 'Knowledge Proof',
      description: 'Fill 100% with 90% accuracy + complete a timed recall',
      threshold: 90,
      metric: 'combined accuracy',
    },
    timeEstimate: '~35 min',
  },
  {
    id: 9,
    name: 'Performance Ready',
    subtitle: 'By Heart',
    categories: 'transfer',
    tasks: [
      { toolId: 'perform', title: 'Full performance', description: 'Complete run with gestures and timing' },
      { toolId: 'perform', title: 'Cold performance', description: 'No warm-up — true readiness test' },
      { toolId: 'recall', title: 'Pressure recall', description: 'Timed recall under 2 minutes' },
    ],
    challenge: {
      type: 'perform',
      title: 'Stage Test',
      description: 'Cold performance scored 90%+ — perform this by heart',
      threshold: 90,
      metric: 'performance score',
    },
    timeEstimate: '~25 min',
  },
  {
    id: 10,
    name: 'True Mastery',
    subtitle: 'Spaced Repetition Lock-In',
    categories: 'mastery',
    tasks: [
      { toolId: 'perform', title: 'Spaced performance', description: 'Perform after 3+ day gap' },
      { toolId: 'recall', title: 'Spaced recall', description: 'Cold recall after gap — still solid?' },
      { toolId: 'perform', title: 'Final cold run', description: 'No prep, full script — the final test' },
    ],
    challenge: {
      type: 'perform',
      title: 'Mastery Seal',
      description: 'Pass cold performance after 3+ days away. Spaced repetition proves true retention.',
      threshold: 90,
      metric: 'retention after gap',
    },
    timeEstimate: 'Spread over days',
  },
] as const
