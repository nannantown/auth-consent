'use client'

import { ProfileCompletion } from '@/types/profile'
import { useI18n } from '@/lib/i18n'

interface ProfileHeaderProps {
  name: string | null
  email: string
  avatarUrl: string | null
  completion: ProfileCompletion
}

export function ProfileHeader({ name, email, avatarUrl, completion }: ProfileHeaderProps) {
  const { t } = useI18n()
  const displayName = name || email.split('@')[0]
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: 'var(--active-bg)' }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {initials}
              </span>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-base font-medium tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {displayName}
            </h1>
            <p
              className="text-xs truncate"
              style={{ color: 'var(--text-muted)' }}
            >
              {email}
            </p>

            {/* Completion Progress */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="label"
                >
                  {t.profile?.completion || 'Profile Completion'}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {completion.percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="relative h-1 rounded-full overflow-hidden"
                style={{ background: 'var(--border-subtle)' }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${completion.percentage}%`,
                    background: 'var(--text-secondary)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
