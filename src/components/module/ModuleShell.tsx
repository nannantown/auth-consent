'use client'

import { type ReactNode } from 'react'
import { Skeleton, Tabs } from '@ground/ui'

interface Tab {
  value: string
  label: string
  count?: number
}

interface ModuleShellProps {
  title: string
  icon?: ReactNode
  tabs?: Tab[]
  activeTab?: string
  onTabChange?: (value: string) => void
  actions?: ReactNode
  children: ReactNode
  loading?: boolean
  empty?: ReactNode
  className?: string
}

export function ModuleShell({
  title,
  icon,
  tabs,
  activeTab,
  onTabChange,
  actions,
  children,
  loading,
  empty,
  className,
}: ModuleShellProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)',
        minHeight: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 'var(--space-lg)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {icon && (
            <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{icon}</span>
          )}
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: 0 }}>
            {title}
          </h2>
        </div>
        {actions}
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && activeTab && onTabChange && (
        <Tabs items={tabs} value={activeTab} onChange={onTabChange} />
      )}

      {/* Content area */}
      <div style={{ flex: 1 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Skeleton variant="title" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="text" count={3} />
          </div>
        ) : empty ? (
          empty
        ) : (
          children
        )}
      </div>
    </div>
  )
}
