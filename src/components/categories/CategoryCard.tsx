'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

interface CategoryCardCategory {
  slug: string
  name: string
  nameEn?: string
  name_en?: string
  description: string
  descriptionEn?: string
  description_en?: string
  icon?: string
  color?: string
}

interface CategoryCardProps {
  category: CategoryCardCategory
  isEmpty?: boolean
  emptyMessage?: string
  onRemove?: () => Promise<void>
  canRemove?: boolean
}

export function CategoryCard({
  category,
  isEmpty = true,
  emptyMessage,
  onRemove,
  canRemove = false,
}: CategoryCardProps) {
  const { t, language } = useI18n()
  const [showConfirm, setShowConfirm] = useState(false)
  const [removing, setRemoving] = useState(false)

  const name = language === 'en'
    ? (category.nameEn || category.name_en || category.name)
    : category.name
  const description = language === 'en'
    ? (category.descriptionEn || category.description_en || category.description)
    : category.description
  const defaultEmpty = t.dashboard.noDataYet

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowConfirm(true)
  }

  const handleConfirmRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!onRemove) return
    setRemoving(true)
    try {
      await onRemove()
    } finally {
      setRemoving(false)
      setShowConfirm(false)
    }
  }

  const handleCancelRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowConfirm(false)
  }

  const confirmText = t.dashboard.remove
  const cancelText = t.dashboard.cancel
  const confirmMessage = language === 'en'
    ? `Remove "${name}" from dashboard?`
    : `「${name}」をダッシュボードから削除しますか？`

  return (
    <div className="relative">
      <Link
        href={`/dashboard/${category.slug}`}
        className="group block transition-all"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Color indicator */}
              {category.color && (
                <div
                  className="w-1 h-10 rounded-sm flex-shrink-0"
                  style={{ background: category.color }}
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {name}
                </h3>
                <p
                  className="text-xs mt-0.5 line-clamp-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isEmpty ? (emptyMessage || defaultEmpty) : description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Remove Button */}
              {canRemove && onRemove && (
                <button
                  onClick={handleRemoveClick}
                  className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  style={{ color: 'var(--text-muted)' }}
                  title={t.dashboard.removeSpace}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ transition: 'color var(--transition-fast)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Arrow */}
              <div
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center transition-transform group-hover:translate-x-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Confirmation Modal */}
      {showConfirm && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/70"
            style={{ zIndex: 9998 }}
            onClick={handleCancelRemove}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div
              className="relative w-full max-w-sm animate-scale-in"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <p
                  className="text-sm mb-6"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {confirmMessage}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelRemove}
                    className="btn btn-secondary flex-1 text-sm py-2.5"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={handleConfirmRemove}
                    disabled={removing}
                    className="btn btn-danger flex-1 text-sm py-2.5 disabled:opacity-40"
                  >
                    {removing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      confirmText
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
