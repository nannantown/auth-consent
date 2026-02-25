'use client'

import { useI18n } from '@/lib/i18n'

interface DashboardHeaderProps {
  displayName: string | null
  email: string
}

export function DashboardHeader({ displayName, email }: DashboardHeaderProps) {
  const { t } = useI18n()
  const name = displayName || email.split('@')[0]

  return (
    <div className="mb-8 opacity-0 animate-fade-in">
      <h1
        className="text-xl md:text-2xl font-semibold tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {t.dashboard.greeting
          ? t.dashboard.greeting.replace('{name}', name)
          : `Hi, ${name}!`}
      </h1>
      <p
        className="text-xs mt-0.5"
        style={{ color: 'var(--text-muted)' }}
      >
        {t.dashboard.greetingSubtitle || ''}
      </p>
    </div>
  )
}
