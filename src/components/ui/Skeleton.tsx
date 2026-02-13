'use client'

interface SkeletonProps {
  variant?: 'text' | 'title' | 'card' | 'circle' | 'custom'
  width?: string | number
  height?: string | number
  className?: string
  count?: number
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}: SkeletonProps) {
  const baseClass = {
    text: 'skeleton skeleton-text',
    title: 'skeleton skeleton-title',
    card: 'skeleton skeleton-card',
    circle: 'skeleton rounded-full',
    custom: 'skeleton',
  }[variant]

  const style = {
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  }

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClass} ${className}`}
            style={{
              ...style,
              ...(variant === 'text' && i === count - 1 ? { width: '60%' } : {}),
            }}
          />
        ))}
      </>
    )
  }

  return <div className={`${baseClass} ${className}`} style={style} />
}
