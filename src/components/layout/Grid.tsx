'use client'

import { useId, type ReactNode, type CSSProperties } from 'react'

type Gap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ResponsiveCols {
  sm?: number
  md?: number
  lg?: number
}

interface GridProps {
  children: ReactNode
  cols?: number | ResponsiveCols
  /** Min column width for auto-fit when cols is not specified */
  minColWidth?: number
  gap?: Gap
  className?: string
  style?: CSSProperties
}

const gapMap: Record<Gap, string> = {
  xs: 'var(--space-xs)',
  sm: 'var(--space-sm)',
  md: 'var(--space-md)',
  lg: 'var(--space-lg)',
  xl: 'var(--space-xl)',
}

export function Grid({
  children,
  cols,
  minColWidth = 240,
  gap = 'lg',
  className,
  style,
}: GridProps) {
  const id = useId()
  const gridId = `grid-${id.replace(/:/g, '')}`

  if (typeof cols === 'object') {
    const sm = cols.sm ?? 1
    const md = cols.md ?? sm
    const lg = cols.lg ?? md

    return (
      <>
        <style>{`
          #${gridId} { grid-template-columns: repeat(${sm}, 1fr); }
          @media (min-width: 640px) {
            #${gridId} { grid-template-columns: repeat(${md}, 1fr); }
          }
          @media (min-width: 1024px) {
            #${gridId} { grid-template-columns: repeat(${lg}, 1fr); }
          }
        `}</style>
        <div
          id={gridId}
          className={className}
          style={{
            display: 'grid',
            gap: gapMap[gap],
            ...style,
          }}
        >
          {children}
        </div>
      </>
    )
  }

  const gridTemplateColumns = cols
    ? `repeat(${cols}, 1fr)`
    : `repeat(auto-fit, minmax(${minColWidth}px, 1fr))`

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap: gapMap[gap],
        ...style,
      }}
    >
      {children}
    </div>
  )
}
