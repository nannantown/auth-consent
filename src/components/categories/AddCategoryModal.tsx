'use client'

import { useState } from 'react'
import { Category, getAddableCategories } from '@/types/category'
import { useI18n } from '@/lib/i18n'

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (slug: string) => Promise<void>
  enabledSlugs: string[]
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onAdd,
  enabledSlugs,
}: AddCategoryModalProps) {
  const { language } = useI18n()
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen) return null

  const availableCategories = getAddableCategories().filter(
    (c) => !enabledSlugs.includes(c.slug)
  )

  const handleAdd = async (category: Category) => {
    setLoading(category.slug)
    try {
      await onAdd(category.slug)
      onClose()
    } catch (error) {
      console.error('Failed to add category:', error)
    } finally {
      setLoading(null)
    }
  }

  const title = language === 'en' ? 'Add Category' : 'カテゴリを追加'
  const description = language === 'en'
    ? 'Choose a category to start managing'
    : '管理したいカテゴリを選択してください'
  const emptyMessage = language === 'en'
    ? 'All categories have been added'
    : 'すべてのカテゴリが追加済みです'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl animate-scale-in"
          style={{
            background: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
          >
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                {title}
              </h2>
              <p
                className="text-sm mt-0.5"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'var(--foreground-muted)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {availableCategories.length === 0 ? (
              <div className="text-center py-8">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p style={{ color: 'var(--foreground-muted)' }}>{emptyMessage}</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {availableCategories.map((category) => {
                  const name = language === 'en' ? category.nameEn : category.name
                  const desc = language === 'en' ? category.descriptionEn : category.description
                  const isLoading = loading === category.slug

                  return (
                    <button
                      key={category.slug}
                      onClick={() => handleAdd(category)}
                      disabled={isLoading}
                      className="group relative w-full text-left rounded-xl overflow-hidden transition-all duration-200 hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      {/* Hover gradient */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${category.color}15 0%, transparent 100%)`,
                        }}
                      />

                      <div className="relative flex items-center gap-4 p-4">
                        {/* Icon */}
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${category.color}30, ${category.color}15)`,
                          }}
                        >
                          {category.icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-medium"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {name}
                          </h3>
                          <p
                            className="text-sm mt-0.5 line-clamp-1"
                            style={{ color: 'var(--foreground-muted)' }}
                          >
                            {desc}
                          </p>
                        </div>

                        {/* Add indicator */}
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                        >
                          {isLoading ? (
                            <div
                              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                              style={{ borderColor: category.color, borderTopColor: 'transparent' }}
                            />
                          ) : (
                            <svg
                              className="w-4 h-4 transition-transform group-hover:scale-110"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              style={{ color: category.color }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
