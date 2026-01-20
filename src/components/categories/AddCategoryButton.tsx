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
  const { language } = useI18n()
  const title = language === 'en' ? 'Add Category' : 'カテゴリを追加'
  const description = language === 'en'
    ? 'Add a category to start managing your information'
    : '管理したい情報を追加しましょう'

  if (variant === 'prominent') {
    return (
      <button
        onClick={onClick}
        className="group relative w-full rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
        style={{
          background: 'rgba(17, 24, 39, 0.4)',
          border: '2px dashed rgba(99, 102, 241, 0.3)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Hover gradient */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%, rgba(6, 182, 212, 0.1) 100%)',
          }}
        />

        <div className="relative flex flex-col items-center justify-center py-10 px-6">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-primary-dark))',
              boxShadow: '0 4px 20px -5px var(--centra-primary)',
            }}
          >
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>

          <h3
            className="font-semibold text-lg"
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </h3>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--foreground-muted)' }}
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
      className="group relative w-full rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: 'rgba(17, 24, 39, 0.3)',
        border: '1px dashed rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Hover gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%)',
        }}
      />

      <div className="relative flex items-center justify-center gap-3 py-5 px-6">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-primary-dark))',
          }}
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span
          className="font-medium"
          style={{ color: 'var(--foreground-muted)' }}
        >
          {title}
        </span>
      </div>
    </button>
  )
}
