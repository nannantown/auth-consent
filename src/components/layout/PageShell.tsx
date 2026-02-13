'use client'

import type { ReactNode } from 'react'

interface PageShellProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  backHref?: string
  children: ReactNode
  maxWidth?: 'default' | 'wide' | 'full'
  className?: string
}

const maxWidthMap = {
  default: 'var(--container-max)',
  wide: 'var(--container-wide)',
  full: '100%',
}

export function PageShell({
  title,
  subtitle,
  actions,
  backHref,
  children,
  maxWidth = 'default',
  className,
}: PageShellProps) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        maxWidth: maxWidthMap[maxWidth],
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 'var(--space-xl) var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xl)',
        minHeight: '100dvh',
      }}
    >
      {/* Back navigation */}
      {backHref && (
        <a
          href={backHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
            textDecoration: 'none',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </a>
      )}

      {/* Header */}
      {(title || actions) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {title && (
              <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        {children}
      </div>
    </div>
  )
}
