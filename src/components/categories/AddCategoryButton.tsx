'use client'

import { useI18n } from '@/lib/i18n'

interface AddCategoryButtonProps {
  onClick: () => void
  variant?: 'default' | 'prominent'
}

export function AddCategoryButton({
  onClick,
  variant = 'default',
}: AddCategoryButtonProps) {
  const { t } = useI18n()
  const title = t.dashboard.addSpace
  const description = t.dashboard.addSpaceDescription

  if (variant === 'prominent') {
    return (
      <button
        onClick={onClick}
        className="group w-full transition-all"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px dashed var(--border-default)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div className="flex flex-col items-center justify-center py-10 px-6">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center mb-4 transition-all group-hover:bg-white group-hover:text-black"
            style={{
              background: 'var(--active-bg)',
              color: 'var(--text-secondary)',
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>

          <h3
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h3>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {description}
          </p>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="group w-full transition-all"
      style={{
        background: 'transparent',
        border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div className="flex items-center justify-center gap-2 py-3 px-4">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: 'var(--text-muted)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
        <span
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {title}
        </span>
      </div>
    </button>
  )
}
