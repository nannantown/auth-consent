'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

interface ModalCategory {
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

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (slug: string) => Promise<void>
  enabledSlugs: string[]
  availableCategories: ModalCategory[]
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onAdd,
  enabledSlugs,
  availableCategories,
}: AddCategoryModalProps) {
  const { t, language } = useI18n()
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen) return null

  const filteredCategories = availableCategories.filter(
    (c) => !enabledSlugs.includes(c.slug)
  )

  const handleAdd = async (category: ModalCategory) => {
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

  const title = t.dashboard.addSpace
  const description = t.dashboard.selectSpace
  const emptyMessage = t.dashboard.noMoreSpaces

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg max-h-[80vh] overflow-hidden animate-scale-in"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div>
              <h2
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-3 max-h-[60vh] overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{emptyMessage}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCategories.map((category) => {
                  const catName = language === 'en'
                    ? (category.nameEn || category.name_en || category.name)
                    : category.name
                  const desc = language === 'en'
                    ? (category.descriptionEn || category.description_en || category.description)
                    : category.description
                  const isLoading = loading === category.slug

                  return (
                    <button
                      key={category.slug}
                      onClick={() => handleAdd(category)}
                      disabled={isLoading}
                      className="group w-full text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: 'transparent',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Color indicator */}
                        {category.color && (
                          <div
                            className="w-1 h-8 rounded-sm flex-shrink-0"
                            style={{ background: category.color }}
                          />
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-sm font-medium"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {catName}
                          </h3>
                          <p
                            className="text-xs mt-0.5 line-clamp-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {desc}
                          </p>
                        </div>

                        {/* Add indicator */}
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          {isLoading ? (
                            <div
                              className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                              style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
                            />
                          ) : (
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
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
