interface ProgressBarProps {
  value: number
  max?: number
  color?: string
}

export function ProgressBar({ value, max = 100, color = 'var(--color-green-main)' }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="flex-1 h-1 bg-[var(--color-gray-200)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-400"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}
