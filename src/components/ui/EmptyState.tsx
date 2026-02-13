'use client'

import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && (
        <div style={{ color: 'var(--text-muted)' }}>
          {icon}
        </div>
      )}
      <div>
        <p
          className="text-sm font-medium mb-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          {title}
        </p>
        {description && (
          <p
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
