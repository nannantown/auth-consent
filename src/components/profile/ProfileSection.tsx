'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

interface ProfileSectionProps {
  title: string
  editHref?: string
  onAdd?: () => void
  addLabel?: string
  children: ReactNode
  isEmpty?: boolean
  emptyMessage?: string
  icon?: ReactNode
}

export function ProfileSection({
  title,
  editHref,
  onAdd,
  addLabel,
  children,
  isEmpty = false,
  emptyMessage = 'No data registered',
}: ProfileSectionProps) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <h2
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h2>

        <div className="flex items-center gap-2">
          {onAdd && (
            <button
              onClick={onAdd}
              className="btn btn-secondary text-xs py-1.5 px-3"
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              {addLabel || 'Add'}
            </button>
          )}
          {editHref && (
            <Link
              href={editHref}
              className="text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {emptyMessage}
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
