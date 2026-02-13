'use client'

interface DividerProps {
  /** Divider orientation */
  direction?: 'horizontal' | 'vertical'
  /** Optional label rendered in the center */
  label?: string
  className?: string
}

export function Divider({ direction = 'horizontal', label, className }: DividerProps) {
  if (direction === 'vertical') {
    return (
      <div
        className={className}
        style={{
          width: '1px',
          alignSelf: 'stretch',
          background: 'var(--border-subtle)',
          flexShrink: 0,
        }}
      />
    )
  }

  if (label) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}
      >
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        <span
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
        >
          {label}
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
      </div>
    )
  }

  return <hr className={`divider ${className || ''}`} />
}
