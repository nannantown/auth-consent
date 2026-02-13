'use client'

import type { ReactNode } from 'react'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'accent' | 'neutral'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  /** Custom color (hex). Overrides variant. */
  color?: string
}

export function Badge({ children, variant = 'neutral', color }: BadgeProps) {
  if (color) {
    return (
      <span
        className="badge"
        style={{
          background: `${color}20`,
          color,
        }}
      >
        {children}
      </span>
    )
  }

  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  )
}
