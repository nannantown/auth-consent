'use client'

import type { ReactNode } from 'react'

interface SectionProps {
  title?: string
  action?: ReactNode
  children: ReactNode
  noPadding?: boolean
  divider?: boolean
  className?: string
}

export function Section({
  title,
  action,
  children,
  noPadding,
  divider = true,
  className,
}: SectionProps) {
  return (
    <section
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)',
        ...(divider ? { paddingBottom: 'var(--space-xl)', borderBottom: '1px solid var(--border-subtle)' } : {}),
        ...(noPadding ? { padding: 0 } : {}),
      }}
    >
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {title && (
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
