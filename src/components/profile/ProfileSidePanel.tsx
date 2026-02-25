'use client'

import { useI18n } from '@/lib/i18n'

interface ProfileSidePanelProps {
  spaceCount: number
  onImport: () => void
  onExport: () => void
  onShare: () => void
}

export function ProfileSidePanel({
  spaceCount,
  onImport,
  onExport,
  onShare,
}: ProfileSidePanelProps) {
  const { t, language } = useI18n()

  return (
    <div className="hidden md:block mt-4 space-y-3">
      {/* Overview */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div className="p-4">
          <span className="label block mb-3">
            {language === 'en' ? 'OVERVIEW' : '概要'}
          </span>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {language === 'en' ? 'Spaces' : 'スペース'}
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {spaceCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div className="p-4">
          <span className="label block mb-3">
            {language === 'en' ? 'ACTIONS' : 'アクション'}
          </span>
          <div className="space-y-1">
            <ActionButton
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              }
              label={t.data.import}
              onClick={onImport}
            />
            <ActionButton
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
              label={t.data.export}
              onClick={onExport}
            />
            <ActionButton
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              }
              label={t.sharing.title}
              onClick={onShare}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
      }}
    >
      <span className="flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
        {icon}
      </span>
      {label}
    </button>
  )
}
