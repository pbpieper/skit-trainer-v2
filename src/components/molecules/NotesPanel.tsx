import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import clsx from 'clsx'

function loadSkitNotes(skitId: string): string {
  try { return localStorage.getItem(`skit-notes-${skitId}`) || '' }
  catch { return '' }
}

function saveSkitNotes(skitId: string, notes: string): void {
  localStorage.setItem(`skit-notes-${skitId}`, notes)
}

function loadAppFeedback(): string {
  try { return localStorage.getItem('skit-trainer-feedback') || '' }
  catch { return '' }
}

function saveAppFeedback(feedback: string): void {
  localStorage.setItem('skit-trainer-feedback', feedback)
}

type Tab = 'skit' | 'app'

export function NotesPanel() {
  const { currentSkitId } = useApp()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('skit')
  const [notes, setNotes] = useState(() => loadSkitNotes(currentSkitId))
  const [appFeedback, setAppFeedback] = useState(loadAppFeedback)

  // Reload skit notes when skit changes
  useEffect(() => {
    setNotes(loadSkitNotes(currentSkitId))
  }, [currentSkitId])

  // Auto-save skit notes
  useEffect(() => {
    if (currentSkitId) saveSkitNotes(currentSkitId, notes)
  }, [notes, currentSkitId])

  // Auto-save app feedback
  useEffect(() => {
    saveAppFeedback(appFeedback)
  }, [appFeedback])

  return (
    <div className="mb-3 inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-colors',
          open
            ? 'bg-[var(--color-pink-faded,#fce4ec)] border border-[var(--color-pink,#e91e63)] text-[var(--color-pink-dark,#880e4f)]'
            : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-green-light)]',
        )}
      >
        Notes
        <span className="text-[10px] ml-1">{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              {/* Tab selector */}
              <div className="flex gap-1 mb-2">
                <button
                  onClick={() => setTab('skit')}
                  className={clsx(
                    'px-2.5 py-1 rounded-[10px] text-[11px] font-semibold cursor-pointer transition-colors border',
                    tab === 'skit'
                      ? 'bg-[var(--color-green-faded)] text-[var(--color-green-dark)] border-[var(--color-green-light)]'
                      : 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-secondary)]',
                  )}
                >
                  This Skit
                </button>
                <button
                  onClick={() => setTab('app')}
                  className={clsx(
                    'px-2.5 py-1 rounded-[10px] text-[11px] font-semibold cursor-pointer transition-colors border',
                    tab === 'app'
                      ? 'bg-[var(--color-pink-faded,#fce4ec)] text-[var(--color-pink-dark,#880e4f)] border-[var(--color-pink,#e91e63)]'
                      : 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-secondary)]',
                  )}
                >
                  App Feedback
                </button>
              </div>

              {tab === 'skit' ? (
                <>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Notes about this skit — interpretations, cues, performance ideas..."
                    className="w-full min-h-[100px] p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[13px] leading-relaxed text-[var(--color-text)] resize-y focus:outline-none focus:border-[var(--color-green-main)]"
                  />
                  <div className="text-[10px] text-[var(--color-text-muted)] mt-1 text-right">
                    {notes.length} chars
                  </div>
                </>
              ) : (
                <>
                  <textarea
                    value={appFeedback}
                    onChange={e => setAppFeedback(e.target.value)}
                    placeholder="Ideas, bugs, suggestions for the app itself..."
                    className="w-full min-h-[100px] p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[13px] leading-relaxed text-[var(--color-text)] resize-y focus:outline-none focus:border-[var(--color-pink,#e91e63)]"
                  />
                  <div className="text-[10px] text-[var(--color-text-muted)] mt-1 text-right">
                    {appFeedback.length} chars &middot; saved locally
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
