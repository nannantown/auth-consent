'use client'

import { useState } from 'react'
import { Product, ProductInput, STATUS_LABELS } from '@/types/product'
import { useI18n } from '@/lib/i18n'

interface ProductFormProps {
  product?: Product | null
  onSave: (data: ProductInput) => Promise<void>
  onCancel: () => void
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const { language } = useI18n()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ProductInput>({
    name: product?.name || '',
    description: product?.description || '',
    status: product?.status || 'active',
    vision: product?.vision || '',
    mission: product?.mission || '',
  })

  const labels = STATUS_LABELS[language as 'ja' | 'en'] || STATUS_LABELS.ja

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSaving(true)
    try {
      await onSave(formData)
    } finally {
      setSaving(false)
    }
  }

  const isEdit = !!product

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(17, 24, 39, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
          {isEdit
            ? (language === 'en' ? 'Edit Product' : 'プロダクトを編集')
            : (language === 'en' ? 'New Product' : '新規プロダクト')}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Name */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {language === 'en' ? 'Product Name' : 'プロダクト名'} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--foreground)',
            }}
            placeholder={language === 'en' ? 'Enter product name' : 'プロダクト名を入力'}
          />
        </div>

        {/* Description */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {language === 'en' ? 'Description' : '説明'}
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--foreground)',
            }}
            placeholder={language === 'en' ? 'Brief description of the product' : 'プロダクトの簡単な説明'}
          />
        </div>

        {/* Status */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {language === 'en' ? 'Status' : 'ステータス'}
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductInput['status'] })}
            className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--foreground)',
            }}
          >
            <option value="active">{labels.product.active}</option>
            <option value="planning">{labels.product.planning}</option>
            <option value="archived">{labels.product.archived}</option>
          </select>
        </div>

        {/* Vision */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {language === 'en' ? 'Vision' : 'ビジョン'}
          </label>
          <textarea
            value={formData.vision || ''}
            onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--foreground)',
            }}
            placeholder={language === 'en' ? 'What is the long-term vision?' : '長期的なビジョンは？'}
          />
        </div>

        {/* Mission */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {language === 'en' ? 'Mission' : 'ミッション'}
          </label>
          <textarea
            value={formData.mission || ''}
            onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--foreground)',
            }}
            placeholder={language === 'en' ? 'What problem does it solve?' : 'どんな課題を解決する？'}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--foreground-muted)',
            }}
          >
            {language === 'en' ? 'Cancel' : 'キャンセル'}
          </button>
          <button
            type="submit"
            disabled={saving || !formData.name.trim()}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color: 'white',
            }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </span>
            ) : (
              language === 'en' ? 'Save' : '保存'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
