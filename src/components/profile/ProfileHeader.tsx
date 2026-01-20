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
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background with gradient */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(6, 182, 212, 0.15) 100%)',
        }}
      />

      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-50"
        style={{
          background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-secondary), var(--centra-accent), var(--centra-primary))',
          backgroundSize: '300% 300%',
          animation: 'gradient-shift 8s ease infinite',
          padding: '1px',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />

      {/* Glass overlay */}
      <div
        className="relative backdrop-blur-xl rounded-2xl p-8"
        style={{
          background: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-start gap-6">
          {/* Avatar with glow */}
          <div className="relative group">
            <div
              className="absolute -inset-1 rounded-full opacity-60 blur-md transition-all duration-500 group-hover:opacity-80"
              style={{
                background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-secondary))',
              }}
            />
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/10"
              style={{
                background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-primary-dark))',
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white tracking-tight">
                  {initials}
                </span>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold tracking-tight mb-1"
              style={{ color: 'var(--foreground)' }}
            >
              {displayName}
            </h1>
            <p
              className="text-sm mb-4 truncate"
              style={{ color: 'var(--foreground-muted)' }}
            >
              {email}
            </p>

            {/* Completion Progress - Premium Style */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {t.profile?.completion || 'Profile Completion'}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {completion.percentage}%
                </span>
              </div>

              {/* Progress bar with gradient */}
              <div
                className="relative h-2 rounded-full overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${completion.percentage}%`,
                    background: 'linear-gradient(90deg, var(--centra-primary), var(--centra-secondary))',
                    boxShadow: '0 0 20px var(--centra-primary)',
                  }}
                />
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    animation: 'shimmer 2s infinite',
                  }}
                />
              </div>

              {completion.percentage < 100 && (
                <p
                  className="text-xs mt-2"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {t.profile?.completeProfile || 'Complete your profile for better service'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
