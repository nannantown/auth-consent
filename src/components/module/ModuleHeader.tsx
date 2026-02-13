'use client'

import type { ReactNode } from 'react'

interface ModuleHeaderProps {
  title: string
  icon?: ReactNode
  subtitle?: string
  actions?: ReactNode
}

export function ModuleHeader({
  title,
  icon,
  subtitle,
  actions,
}: ModuleHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        {icon && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              color: 'var(--text-muted)',
            }}
          >
            {icon}
          </span>
        )}
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions}
    </div>
  )
}
