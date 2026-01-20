'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Category } from '@/types/category'
import { useI18n } from '@/lib/i18n'

interface CategoryCardProps {
  category: Category
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
  const { language } = useI18n()
  const [showConfirm, setShowConfirm] = useState(false)
  const [removing, setRemoving] = useState(false)

  const name = language === 'en' ? category.nameEn : category.name
  const description = language === 'en' ? category.descriptionEn : category.description
  const defaultEmpty = language === 'en' ? 'No data registered yet' : 'まだ情報が登録されていません'

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

  const confirmText = language === 'en' ? 'Remove' : '削除'
  const cancelText = language === 'en' ? 'Cancel' : 'キャンセル'
  const confirmMessage = language === 'en'
    ? `Remove "${name}" from dashboard?`
    : `「${name}」をダッシュボードから削除しますか？`

  return (
    <div className="relative">
      <Link
        href={`/dashboard/${category.slug}`}
        className="group relative block rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
        style={{
          background: 'rgba(17, 24, 39, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Subtle gradient glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${category.color}15 0%, transparent 50%, ${category.color}10 100%)`,
          }}
        />

        {/* Content */}
        <div className="relative px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${category.color}30, ${category.color}15)`,
                }}
              >
                {category.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold tracking-tight"
                  style={{ color: 'var(--foreground)' }}
                >
                  {name}
                </h3>
                <p
                  className="text-sm mt-0.5 line-clamp-1"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {isEmpty ? (emptyMessage || defaultEmpty) : description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Remove Button */}
              {canRemove && onRemove && (
                <button
                  onClick={handleRemoveClick}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-red-500/20"
                  style={{ color: 'var(--foreground-muted)' }}
                  title={language === 'en' ? 'Remove category' : 'カテゴリを削除'}
                >
                  <svg
                    className="w-4 h-4 hover:text-red-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}

              {/* Arrow */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Confirmation Modal */}
      {showConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            onClick={handleCancelRemove}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div
              className="relative w-full max-w-sm rounded-2xl overflow-hidden animate-scale-in"
              style={{
                background: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${category.color}30, ${category.color}15)`,
                  }}
                >
                  {category.icon}
                </div>

                <p
                  className="text-sm mb-6"
                  style={{ color: 'var(--foreground)' }}
                >
                  {confirmMessage}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelRemove}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/10"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--foreground-muted)',
                    }}
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={handleConfirmRemove}
                    disabled={removing}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-600 disabled:opacity-50"
                    style={{
                      background: '#ef4444',
                      color: 'white',
                    }}
                  >
                    {removing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </span>
                    ) : (
                      confirmText
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
