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
        background: 'var(--bg-translucent)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="px-6 py-5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
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
            style={{ color: 'var(--text-muted)' }}
          >
            {language === 'en' ? 'Product Name' : 'プロダクト名'} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="input"
            placeholder={language === 'en' ? 'Enter product name' : 'プロダクト名を入力'}
          />
        </div>

        {/* Description */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {language === 'en' ? 'Description' : '説明'}
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="textarea"
            placeholder={language === 'en' ? 'Brief description of the product' : 'プロダクトの簡単な説明'}
          />
        </div>

        {/* Status */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {language === 'en' ? 'Status' : 'ステータス'}
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductInput['status'] })}
            className="select"
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
            style={{ color: 'var(--text-muted)' }}
          >
            {language === 'en' ? 'Vision' : 'ビジョン'}
          </label>
          <textarea
            value={formData.vision || ''}
            onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            rows={2}
            className="textarea"
            placeholder={language === 'en' ? 'What is the long-term vision?' : '長期的なビジョンは？'}
          />
        </div>

        {/* Mission */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {language === 'en' ? 'Mission' : 'ミッション'}
          </label>
          <textarea
            value={formData.mission || ''}
            onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
            rows={2}
            className="textarea"
            placeholder={language === 'en' ? 'What problem does it solve?' : 'どんな課題を解決する？'}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary flex-1"
          >
            {language === 'en' ? 'Cancel' : 'キャンセル'}
          </button>
          <button
            type="submit"
            disabled={saving || !formData.name.trim()}
            className="btn btn-primary flex-1"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
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
