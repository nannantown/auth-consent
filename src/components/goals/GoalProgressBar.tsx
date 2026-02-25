'use client'

interface GoalProgressBarProps {
  progress: number
  size?: 'sm' | 'md'
}

export function GoalProgressBar({ progress, size = 'md' }: GoalProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress))
  const height = size === 'sm' ? 'h-1.5' : 'h-2'

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-1 ${height} rounded-full overflow-hidden`}
        style={{ background: 'var(--bg-surface)' }}
      >
        <div
          className={`${height} rounded-full transition-all duration-500 ease-out`}
          style={{
            width: `${clamped}%`,
            background: 'var(--success)',
          }}
        />
      </div>
      <span
        className="text-xs font-medium tabular-nums flex-shrink-0"
        style={{ color: 'var(--text-secondary)', minWidth: '2.5rem', textAlign: 'right' }}
      >
        {clamped}%
      </span>
    </div>
  )
}
