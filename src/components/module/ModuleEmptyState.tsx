'use client'

import type { ReactNode } from 'react'

interface ModuleEmptyStateProps {
  moduleName: string
  description?: string
  steps?: string[]
  action?: ReactNode
}

export function ModuleEmptyState({
  moduleName,
  description,
  steps,
  action,
}: ModuleEmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-3xl) var(--space-xl)',
        textAlign: 'center',
        gap: 'var(--space-xl)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: 0 }}>
          {moduleName}
        </h3>
        {description && (
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', margin: 0, maxWidth: 400 }}>
            {description}
          </p>
        )}
      </div>

      {steps && steps.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
            textAlign: 'left',
            width: '100%',
            maxWidth: 320,
          }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 'var(--space-md)',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-muted)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 500, margin: 0 }}>
                {step}
              </p>
            </div>
          ))}
        </div>
      )}

      {action}
    </div>
  )
}
