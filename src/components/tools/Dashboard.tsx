import { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { colors } from '@/design/tokens'
import * as api from '@/services/progressApi'
import type { DashboardData, DailyStat } from '@/services/progressApi'

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function WeekGrid({ stats }: { stats: DailyStat[] }) {
  const today = new Date()
  const days: Array<{ date: string; label: string; stat: DailyStat | null }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' })
    days.push({
      date: dateStr,
      label: dayLabel,
      stat: stats.find(s => s.date === dateStr) ?? null,
    })
  }

  const maxSessions = Math.max(1, ...days.map(d => d.stat?.session_count ?? 0))

  return (
    <div className="flex gap-1.5 justify-between">
      {days.map(d => {
        const intensity = d.stat ? d.stat.session_count / maxSessions : 0
        return (
          <div key={d.date} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[9px] text-[var(--color-text-muted)]">{d.label}</span>
            <div
              className="w-full aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-all"
              style={{
                background: intensity > 0
                  ? `rgba(76, 175, 80, ${0.15 + intensity * 0.65})`
                  : 'var(--color-gray-100)',
                color: intensity > 0.3 ? colors.white : 'var(--color-text-secondary)',
              }}
              title={d.stat ? `${d.stat.session_count} sessions, ${formatDuration(d.stat.total_seconds)}` : 'No activity'}
            >
              {d.stat?.session_count ?? ''}
            </div>
            <span className="text-[8px] text-[var(--color-text-muted)]">
              {d.stat ? formatDuration(d.stat.total_seconds) : '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function MonthChart({ stats }: { stats: DailyStat[] }) {
  if (stats.length === 0) return <p className="text-xs text-[var(--color-text-muted)] text-center py-4">No data yet. Start practicing!</p>

  const maxSeconds = Math.max(1, ...stats.map(s => s.total_seconds))

  return (
    <div className="flex items-end gap-0.5 h-[100px]">
      {stats.slice().reverse().map(s => (
        <div
          key={s.date}
          className="flex-1 rounded-t-sm min-w-[4px] transition-all"
          style={{
            height: `${Math.max(4, (s.total_seconds / maxSeconds) * 100)}%`,
            background: colors.greenMain,
            opacity: 0.6 + (s.total_seconds / maxSeconds) * 0.4,
          }}
          title={`${formatDate(s.date)}: ${formatDuration(s.total_seconds)}, ${s.session_count} sessions`}
        />
      ))}
    </div>
  )
}

export function Dashboard() {
  const { user } = useUser()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    api.getDashboard(user.id)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[var(--color-text-secondary)]">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Dashboard requires the creative-hub backend.
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          Start it: ~/Projects/creative-hub/scripts/start_services.sh all
        </p>
      </div>
    )
  }

  if (!data) return null

  const todayStat = data.daily_stats.find(s => s.date === new Date().toISOString().slice(0, 10))
  const totalTime = data.daily_stats.reduce((sum, s) => sum + s.total_seconds, 0)
  const totalSessions = data.daily_stats.reduce((sum, s) => sum + s.session_count, 0)

  return (
    <div>
      {/* Streak & Summary */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatCard label="Streak" value={`${data.streak.current}`} sub="days" color={colors.greenMain} />
        <StatCard label="Longest" value={`${data.streak.longest}`} sub="days" color={colors.greenDark} />
        <StatCard label="Total Time" value={formatDuration(totalTime)} sub={`${totalSessions} sessions`} color={colors.pink} />
        <StatCard label="Skits Tracked" value={`${data.all_progress.length}`} sub="active" color={colors.greenBright} />
      </div>

      {/* This Week */}
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] mb-4">
        <h3 className="text-sm font-bold text-[var(--color-green-dark)] mb-3">This Week</h3>
        <WeekGrid stats={data.daily_stats} />
      </div>

      {/* Today's Details */}
      {todayStat && (
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] mb-4">
          <h3 className="text-sm font-bold text-[var(--color-green-dark)] mb-2">Today</h3>
          <div className="flex gap-4 text-xs text-[var(--color-text-secondary)]">
            <span><strong className="text-[var(--color-text-primary)]">{todayStat.session_count}</strong> sessions</span>
            <span><strong className="text-[var(--color-text-primary)]">{todayStat.tools_used}</strong> tools</span>
            <span><strong className="text-[var(--color-text-primary)]">{todayStat.skits_practiced}</strong> skits</span>
            <span><strong className="text-[var(--color-text-primary)]">{formatDuration(todayStat.total_seconds)}</strong> practiced</span>
          </div>
          {todayStat.tool_list && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {todayStat.tool_list.split(',').map(t => (
                <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--color-green-faded)] text-[var(--color-green-dark)]">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 30-Day Chart */}
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] mb-4">
        <h3 className="text-sm font-bold text-[var(--color-green-dark)] mb-3">Last 30 Days</h3>
        <MonthChart stats={data.daily_stats} />
        <div className="flex justify-between text-[9px] text-[var(--color-text-muted)] mt-1">
          <span>30d ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Skit Progress Overview */}
      {data.all_progress.length > 0 && (
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] mb-4">
          <h3 className="text-sm font-bold text-[var(--color-green-dark)] mb-3">Skit Mastery</h3>
          {data.all_progress.map(p => {
            const mastered = p.chunk_mastered.length
            const recalls = Object.values(p.recall_scores)
            const got = recalls.filter(v => v === 'got').length
            const total = recalls.length
            return (
              <div key={p.skit_id} className="mb-3 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">{p.skit_id}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {mastered} chunks mastered
                    {total > 0 && ` · ${got}/${total} recall`}
                  </span>
                </div>
                <div className="flex gap-1">
                  <ProgressSegment label="Chunks" value={mastered} max={Math.max(mastered, 10)} color={colors.greenMain} />
                  <ProgressSegment label="Flashcards" value={p.flashcard_correct} max={Math.max(p.flashcard_correct + p.flashcard_wrong, 1)} color={colors.pink} />
                  <ProgressSegment label="Chain" value={p.chain_completed.length} max={Math.max(p.chain_completed.length, 10)} color={colors.greenBright} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Recent Sessions */}
      {data.recent_sessions.length > 0 && (
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
          <h3 className="text-sm font-bold text-[var(--color-green-dark)] mb-3">Recent Sessions</h3>
          <div className="flex flex-col gap-1.5">
            {data.recent_sessions.slice(0, 15).map(s => (
              <div key={s.id} className="flex justify-between items-center text-xs py-1 border-b border-[var(--color-border)] last:border-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--color-green-faded)] text-[var(--color-green-dark)]">{s.tool_id}</span>
                  <span className="text-[var(--color-text-secondary)]">{s.skit_id.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <span>{s.duration_seconds ? formatDuration(s.duration_seconds) : '—'}</span>
                  <span>{new Date(s.started_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-center">
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">{label}</p>
      <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
      <p className="text-[9px] text-[var(--color-text-muted)]">{sub}</p>
    </div>
  )
}

function ProgressSegment({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="flex-1">
      <div className="h-1.5 rounded-full bg-[var(--color-gray-100)] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-[8px] text-[var(--color-text-muted)] mt-0.5 text-center">{label}</p>
    </div>
  )
}
