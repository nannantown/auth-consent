'use client'

import Link from 'next/link'
import { ProfileCompletion } from '@/types/profile'
import { CATEGORY_ICONS, FALLBACK_ICON } from './category-icons'

type SpaceCardSize = 'large' | 'medium' | 'small'

interface SpaceCardCategory {
  slug: string
  name: string
  nameEn?: string
  name_en?: string
  color?: string
  description?: string
  descriptionEn?: string
  description_en?: string
}

interface SpaceCardProps {
  category: SpaceCardCategory
  language: string
  size: SpaceCardSize
  completion?: ProfileCompletion
}

export function SpaceCard({ category, language, size, completion }: SpaceCardProps) {
  const color = category.color || '#6366f1'
  const icon = CATEGORY_ICONS[category.slug] || FALLBACK_ICON
  const name = language === 'en'
    ? (category.nameEn || category.name_en || category.name)
    : category.name
  const description = language === 'en'
    ? (category.descriptionEn || category.description_en || category.description || '')
    : (category.description || '')

  const sizeClasses = {
    large: 'col-span-2 row-span-2',
    medium: 'col-span-2 md:col-span-1',
    small: 'col-span-1',
  }

  if (size === 'large') {
    return (
      <Link
        href={`/dashboard/${category.slug}`}
        className={`${sizeClasses.large} group rounded-2xl p-5 md:p-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 relative overflow-hidden`}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Color accent glow */}
        <div
          className="absolute inset-0 opacity-[0.07] transition-opacity duration-200 group-hover:opacity-[0.12]"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${color}, transparent 70%)`,
          }}
        />

        <div className="relative z-10 h-full flex flex-col">
          {/* Icon */}
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-4"
            style={{
              background: `${color}20`,
              color: color,
            }}
          >
            <div className="w-6 h-6 md:w-7 md:h-7 [&>svg]:w-full [&>svg]:h-full">
              {icon}
            </div>
          </div>

          {/* Name */}
          <h2
            className="text-base md:text-lg font-semibold tracking-tight mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {name}
          </h2>

          {/* Description */}
          <p
            className="text-xs leading-relaxed mb-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            {description}
          </p>

          {/* Completion Bar (for Profile) */}
          {completion && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {completion.percentage}%
                </span>
              </div>
              <div
                className="relative h-1 rounded-full overflow-hidden"
                style={{ background: 'var(--border-subtle)' }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${completion.percentage}%`,
                    background: color,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Arrow */}
        <div
          className="absolute right-4 top-4 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </div>
      </Link>
    )
  }

  if (size === 'medium') {
    return (
      <Link
        href={`/dashboard/${category.slug}`}
        className={`${sizeClasses.medium} group rounded-2xl p-4 md:p-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 relative overflow-hidden`}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Left color accent border */}
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
          style={{ background: color }}
        />

        <div className="relative z-10 flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: `${color}15`,
              color: color,
            }}
          >
            <div className="w-5 h-5 [&>svg]:w-full [&>svg]:h-full">
              {icon}
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-medium tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {name}
            </h3>
            <p
              className="text-[11px] mt-0.5 line-clamp-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {description}
            </p>
          </div>

          {/* Arrow */}
          <div
            className="w-5 h-5 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      </Link>
    )
  }

  // Small
  return (
    <Link
      href={`/dashboard/${category.slug}`}
      className={`${sizeClasses.small} group rounded-xl p-3 md:p-4 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 flex flex-col items-center gap-2 text-center`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200"
        style={{
          background: `${color}15`,
          color: color,
        }}
      >
        <div className="w-4.5 h-4.5 [&>svg]:w-full [&>svg]:h-full" style={{ width: 18, height: 18 }}>
          {icon}
        </div>
      </div>
      <span
        className="text-[11px] font-medium leading-tight line-clamp-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        {name}
      </span>
    </Link>
  )
}

// Add Space Card (dashed border)
interface AddSpaceCardProps {
  onClick: () => void
  label: string
}

export function AddSpaceCard({ onClick, label }: AddSpaceCardProps) {
  return (
    <button
      onClick={onClick}
      className="col-span-1 group rounded-xl p-3 md:p-4 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] flex flex-col items-center gap-2 text-center cursor-pointer"
      style={{
        border: '1.5px dashed var(--border-default)',
        background: 'transparent',
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <span
        className="text-[11px] font-medium leading-tight"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>
    </button>
  )
}
