'use client'

import type { ReactNode, CSSProperties } from 'react'

interface ContainerProps {
  children: ReactNode
  size?: 'default' | 'wide' | 'full'
  className?: string
  style?: CSSProperties
}

const maxWidthMap = {
  default: 'var(--container-max)',
  wide: 'var(--container-wide)',
  full: '100%',
}

export function Container({
  children,
  size = 'default',
  className,
  style,
}: ContainerProps) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        maxWidth: maxWidthMap[size],
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 'var(--space-lg)',
        paddingRight: 'var(--space-lg)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
