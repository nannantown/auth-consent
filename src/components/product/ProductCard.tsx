'use client'

import { useState } from 'react'
import { Product, STATUS_LABELS } from '@/types/product'
import { useI18n } from '@/lib/i18n'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface ProductCardProps {
  product: Product
  isSelected?: boolean
  onSelect?: (product: Product) => void
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => Promise<void>
}

const statusColor: Record<string, string> = {
  active: 'var(--success)',
  archived: 'var(--neutral)',
  planning: 'var(--warning)',
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

  const labels = STATUS_LABELS[language as 'ja' | 'en'] || STATUS_LABELS.ja
  const statusLabel = labels.product[product.status as keyof typeof labels.product] || product.status
  const color = statusColor[product.status] || 'var(--neutral)'

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
          background: isSelected ? 'var(--accent-bg)' : 'var(--bg-translucent)',
          border: `1px solid ${isSelected ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
          backdropFilter: 'blur(12px)',
          ringColor: 'var(--accent)',
        }}
        onClick={() => onSelect?.(product)}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className="font-semibold truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {product.name}
                </h3>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${color} 20%, transparent)`,
                    color,
                  }}
                >
                  {statusLabel}
                </span>
              </div>
              {product.description && (
                <p
                  className="text-sm line-clamp-2"
                  style={{ color: 'var(--text-muted)' }}
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
                  style={{ color: 'var(--text-muted)' }}
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
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={async () => {
          if (onDelete) await onDelete(product.id)
          setShowConfirm(false)
        }}
        title={language === 'en' ? 'Delete Product' : 'プロダクトを削除'}
        description={confirmMessage}
        confirmLabel={language === 'en' ? 'Delete' : '削除'}
        cancelLabel={language === 'en' ? 'Cancel' : 'キャンセル'}
        variant="danger"
      />
    </>
  )
}
