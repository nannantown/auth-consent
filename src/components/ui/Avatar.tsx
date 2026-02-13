'use client'

import { cn } from '@/lib/cn'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  /** Image URL */
  src?: string | null
  /** User's display name for initials fallback */
  name?: string
  size?: AvatarSize
  className?: string
}

const sizeStyles: Record<AvatarSize, { width: number; height: number; fontSize: string }> = {
  sm: { width: 24, height: 24, fontSize: 'var(--text-xs)' },
  md: { width: 32, height: 32, fontSize: 'var(--text-sm)' },
  lg: { width: 40, height: 40, fontSize: 'var(--text-base)' },
  xl: { width: 56, height: 56, fontSize: 'var(--text-lg)' },
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const s = sizeStyles[size]

  const baseStyle = {
    width: s.width,
    height: s.height,
    borderRadius: 'var(--radius-full)',
    flexShrink: 0 as const,
    overflow: 'hidden' as const,
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        className={className}
        style={{
          ...baseStyle,
          objectFit: 'cover' as const,
        }}
      />
    )
  }

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      style={{
        ...baseStyle,
        background: 'var(--bg-surface)',
        color: 'var(--text-secondary)',
        fontSize: s.fontSize,
        fontWeight: 600,
        letterSpacing: 'var(--letter-spacing-tight)',
      }}
    >
      {name ? getInitials(name) : '?'}
    </div>
  )
}
