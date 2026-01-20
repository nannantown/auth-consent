'use client'

import { useState } from 'react'
import { Product, STATUS_LABELS } from '@/types/product'
import { useI18n } from '@/lib/i18n'

interface ProductCardProps {
  product: Product
  isSelected?: boolean
  onSelect?: (product: Product) => void
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => Promise<void>
}

export function ProductCard({
  product,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const { language } = useI18n()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const labels = STATUS_LABELS[language as 'ja' | 'en'] || STATUS_LABELS.ja
  const statusLabel = labels.product[product.status as keyof typeof labels.product] || product.status

  const statusColor = {
    active: '#22c55e',
    archived: '#64748b',
    planning: '#f59e0b',
  }[product.status] || '#64748b'

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete(product.id)
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  const confirmMessage = language === 'en'
    ? `Delete "${product.name}"? This will also delete all roadmap items and KPIs.`
    : `「${product.name}」を削除しますか？ロードマップとKPIも全て削除されます。`

  return (
    <>
      <div
        className={`relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
          isSelected ? 'ring-2' : ''
        }`}
        style={{
          background: isSelected ? 'rgba(14, 165, 233, 0.1)' : 'rgba(17, 24, 39, 0.4)',
          border: `1px solid ${isSelected ? 'rgba(14, 165, 233, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
          backdropFilter: 'blur(12px)',
          ringColor: '#0ea5e9',
        }}
        onClick={() => onSelect?.(product)}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className="font-semibold truncate"
                  style={{ color: 'var(--foreground)' }}
                >
                  {product.name}
                </h3>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                  style={{
                    background: `${statusColor}20`,
                    color: statusColor,
                  }}
                >
                  {statusLabel}
                </span>
              </div>
              {product.description && (
                <p
                  className="text-sm line-clamp-2"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {product.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(product)
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowConfirm(true)
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/20"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  <svg className="w-4 h-4 hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            onClick={() => setShowConfirm(false)}
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
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: 'rgba(239, 68, 68, 0.2)' }}
                >
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <p className="text-sm mb-6" style={{ color: 'var(--foreground)' }}>
                  {confirmMessage}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/10"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--foreground-muted)',
                    }}
                  >
                    {language === 'en' ? 'Cancel' : 'キャンセル'}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-600 disabled:opacity-50"
                    style={{
                      background: '#ef4444',
                      color: 'white',
                    }}
                  >
                    {deleting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </span>
                    ) : (
                      language === 'en' ? 'Delete' : '削除'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
