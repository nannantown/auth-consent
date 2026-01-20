'use client'

import { useState } from 'react'
import { ProductKPI, ProductKPIInput } from '@/types/product'
import { useI18n } from '@/lib/i18n'

interface KPISectionProps {
  kpis: ProductKPI[]
  productId: string
  onAdd: (input: ProductKPIInput) => Promise<void>
  onUpdate: (kpiId: string, input: Partial<ProductKPIInput>) => Promise<void>
  onDelete: (kpiId: string) => Promise<void>
}

export function KPISection({
  kpis,
  productId,
  onAdd,
  onUpdate,
  onDelete,
}: KPISectionProps) {
  const { language } = useI18n()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(17, 24, 39, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(34, 197, 94, 0.2)' }}
          >
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {language === 'en' ? 'KPIs' : 'KPI'}
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--foreground-muted)',
            }}
          >
            {kpis.length}
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
          style={{ color: '#22c55e' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'en' ? 'Add' : '追加'}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {kpis.length === 0 && !showAddForm ? (
          <div
            className="text-center py-8 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {language === 'en' ? 'No KPIs defined yet' : 'KPIがまだ定義されていません'}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-sm font-medium"
              style={{ color: '#22c55e' }}
            >
              {language === 'en' ? 'Add first KPI' : '最初のKPIを追加'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Add Form */}
            {showAddForm && (
              <KPIForm
                productId={productId}
                onSave={async (input) => {
                  await onAdd(input)
                  setShowAddForm(false)
                }}
                onCancel={() => setShowAddForm(false)}
                language={language}
              />
            )}

            {/* KPI Cards */}
            {kpis.map((kpi) => (
              editingId === kpi.id ? (
                <KPIForm
                  key={kpi.id}
                  productId={productId}
                  kpi={kpi}
                  onSave={async (input) => {
                    await onUpdate(kpi.id, input)
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                  language={language}
                />
              ) : (
                <KPICard
                  key={kpi.id}
                  kpi={kpi}
                  onEdit={() => setEditingId(kpi.id)}
                  onDelete={() => onDelete(kpi.id)}
                  onUpdateValue={(value) => onUpdate(kpi.id, { current_value: value })}
                  language={language}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// KPI Card
function KPICard({
  kpi,
  onEdit,
  onDelete,
  onUpdateValue,
  language,
}: {
  kpi: ProductKPI
  onEdit: () => void
  onDelete: () => void
  onUpdateValue: (value: number) => void
  language: string
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showValueInput, setShowValueInput] = useState(false)
  const [newValue, setNewValue] = useState(kpi.current_value?.toString() || '')

  const progress = kpi.target_value && kpi.current_value
    ? Math.min(100, Math.max(0, (kpi.current_value / kpi.target_value) * 100))
    : 0

  const progressColor = progress >= 100
    ? '#22c55e'
    : progress >= 70
    ? '#3b82f6'
    : progress >= 40
    ? '#f59e0b'
    : '#ef4444'

  const handleUpdateValue = () => {
    const value = parseFloat(newValue)
    if (!isNaN(value)) {
      onUpdateValue(value)
    }
    setShowValueInput(false)
  }

  return (
    <div
      className="relative rounded-xl p-4"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className="font-medium text-sm"
              style={{ color: 'var(--foreground)' }}
            >
              {kpi.name}
            </h4>
            {kpi.unit && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--foreground-muted)',
                }}
              >
                {kpi.unit}
              </span>
            )}
          </div>

          {kpi.description && (
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--foreground-muted)' }}
            >
              {kpi.description}
            </p>
          )}

          {/* Progress Bar */}
          {kpi.target_value != null && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                {showValueInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-20 px-2 py-1 rounded text-xs focus:outline-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'var(--foreground)',
                      }}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateValue()
                        if (e.key === 'Escape') setShowValueInput(false)
                      }}
                    />
                    <button
                      onClick={handleUpdateValue}
                      className="p-1 rounded hover:bg-white/10"
                    >
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowValueInput(false)}
                      className="p-1 rounded hover:bg-white/10"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--foreground-muted)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setNewValue(kpi.current_value?.toString() || '')
                      setShowValueInput(true)
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <span style={{ color: progressColor, fontWeight: 600 }}>
                      {kpi.current_value ?? 0}
                    </span>
                    <span>/</span>
                    <span>{kpi.target_value}</span>
                    <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
                <span style={{ color: progressColor, fontWeight: 600 }}>
                  {progress.toFixed(0)}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: progressColor,
                  }}
                />
              </div>
            </div>
          )}

          {kpi.period && (
            <p
              className="text-xs mt-2"
              style={{ color: 'var(--foreground-muted)' }}
            >
              {language === 'en' ? 'Period' : '期間'}: {kpi.period}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0"
                style={{ zIndex: 9997 }}
                onClick={() => setShowMenu(false)}
              />
              <div
                className="absolute right-0 top-full mt-1 w-32 rounded-xl overflow-hidden shadow-xl"
                style={{
                  zIndex: 9998,
                  background: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <button
                  onClick={() => {
                    onEdit()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 flex items-center gap-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {language === 'en' ? 'Edit' : '編集'}
                </button>
                <button
                  onClick={() => {
                    onDelete()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-red-500/20 flex items-center gap-2 text-red-400 border-t"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {language === 'en' ? 'Delete' : '削除'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// KPI Form
function KPIForm({
  productId,
  kpi,
  onSave,
  onCancel,
  language,
}: {
  productId: string
  kpi?: ProductKPI
  onSave: (input: ProductKPIInput) => Promise<void>
  onCancel: () => void
  language: string
}) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ProductKPIInput>({
    product_id: productId,
    name: kpi?.name || '',
    description: kpi?.description || '',
    current_value: kpi?.current_value ?? undefined,
    target_value: kpi?.target_value ?? undefined,
    unit: kpi?.unit || '',
    period: kpi?.period || '',
  })

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

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-4 space-y-4"
      style={{
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
      }}
    >
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'var(--foreground)',
        }}
        placeholder={language === 'en' ? 'KPI name' : 'KPI名'}
      />

      <input
        type="text"
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'var(--foreground)',
        }}
        placeholder={language === 'en' ? 'Description (optional)' : '説明（任意）'}
      />

      <div className="grid grid-cols-3 gap-3">
        <input
          type="number"
          step="any"
          value={formData.current_value ?? ''}
          onChange={(e) => setFormData({ ...formData, current_value: e.target.value ? parseFloat(e.target.value) : undefined })}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--foreground)',
          }}
          placeholder={language === 'en' ? 'Current' : '現在値'}
        />
        <input
          type="number"
          step="any"
          value={formData.target_value ?? ''}
          onChange={(e) => setFormData({ ...formData, target_value: e.target.value ? parseFloat(e.target.value) : undefined })}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--foreground)',
          }}
          placeholder={language === 'en' ? 'Target' : '目標値'}
        />
        <input
          type="text"
          value={formData.unit || ''}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--foreground)',
          }}
          placeholder={language === 'en' ? 'Unit (%, users)' : '単位（%、人）'}
        />
      </div>

      <input
        type="text"
        value={formData.period || ''}
        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
        className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'var(--foreground)',
        }}
        placeholder={language === 'en' ? 'Period (e.g., Monthly, Q1 2025)' : '期間（例: 月次、Q1 2025）'}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
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
          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            background: '#22c55e',
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
  )
}
