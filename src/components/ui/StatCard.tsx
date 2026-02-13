'use client'

import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  /** Optional trend indicator: positive, negative, or neutral */
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: ReactNode
  className?: string
}

export function StatCard({ label, value, trend, icon, className = '' }: StatCardProps) {
  const trendColor = {
    up: 'var(--success)',
    down: 'var(--error)',
    neutral: 'var(--text-muted)',
  }

  const trendIcon = {
    up: 'M5 10l7-7m0 0l7 7m-7-7v18',
    down: 'M19 14l-7 7m0 0l-7-7m7 7V3',
    neutral: 'M5 12h14',
  }

  return (
    <div className={`card-stat ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-1"
            style={{ color: 'var(--stat-label)' }}
          >
            {label}
          </p>
          <p
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--stat-value)' }}
          >
            {value}
          </p>
        </div>
        {icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
          >
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <svg
            className="w-3 h-3"
            style={{ color: trendColor[trend.direction] }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trendIcon[trend.direction]} />
          </svg>
          <span
            className="text-xs font-medium"
            style={{ color: trendColor[trend.direction] }}
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  )
}
