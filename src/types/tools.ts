export type ToolId =
  | 'read' | 'fill' | 'freewrite' | 'firstletter'
  | 'chunk' | 'flashcard' | 'cue' | 'rsvp'
  | 'chain' | 'recall' | 'loci' | 'perform'
  | 'editor' | 'map' | 'future' | 'dashboard' | 'studyguide'

export interface ToolDef {
  id: ToolId
  label: string
  icon: string
}
