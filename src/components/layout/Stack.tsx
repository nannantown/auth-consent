'use client'

import type { ReactNode, CSSProperties } from 'react'

type Gap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

interface StackProps {
  children: ReactNode
  direction?: 'vertical' | 'horizontal'
  gap?: Gap
  align?: CSSProperties['alignItems']
  justify?: CSSProperties['justifyContent']
  wrap?: boolean
  className?: string
  style?: CSSProperties
}

const gapMap: Record<Gap, string> = {
  none: '0',
  xs: 'var(--space-xs)',
  sm: 'var(--space-sm)',
  md: 'var(--space-md)',
  lg: 'var(--space-lg)',
  xl: 'var(--space-xl)',
  '2xl': 'var(--space-2xl)',
  '3xl': 'var(--space-3xl)',
}

export function Stack({
  children,
  direction = 'vertical',
  gap = 'md',
  align,
  justify,
  wrap,
  className,
  style,
}: StackProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        gap: gapMap[gap],
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
