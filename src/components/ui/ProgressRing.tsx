interface ProgressRingProps {
  /** Progress value 0-100 */
  value: number
  /** Size in pixels */
  size?: number
  /** Stroke width in pixels */
  strokeWidth?: number
  /** Stroke color (CSS variable or color value) */
  color?: string
  /** Show percentage text in center */
  showLabel?: boolean
  className?: string
}

export function ProgressRing({
  value,
  size = 48,
  strokeWidth = 3,
  color = 'var(--success)',
  showLabel = false,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset var(--transition-slow)' }}
        />
      </svg>
      {showLabel && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size < 48 ? 'var(--text-xs)' : 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {Math.round(value)}%
        </span>
      )}
    </div>
  )
}
