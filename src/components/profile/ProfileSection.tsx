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
  icon,
}: ProfileSectionProps) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: 'rgba(17, 24, 39, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Subtle gradient glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, transparent 50%, rgba(6, 182, 212, 0.05) 100%)',
        }}
      />

      {/* Header */}
      <div
        className="relative flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
              }}
            >
              {icon}
            </div>
          )}
          <h2
            className="font-semibold tracking-tight"
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-primary-dark))',
                color: 'white',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {addLabel || 'Add'}
            </button>
          )}
          {editHref && (
            <Link
              href={editHref}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10"
              style={{ color: 'var(--foreground-muted)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative px-6 py-5">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p
              className="text-sm"
              style={{ color: 'var(--foreground-muted)' }}
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
