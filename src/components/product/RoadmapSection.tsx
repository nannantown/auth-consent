'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { RoadmapItem, RoadmapItemInput, STATUS_LABELS, PRIORITY_COLORS, ROADMAP_STATUS_COLORS } from '@/types/product'
import { useI18n } from '@/lib/i18n'

interface RoadmapSectionProps {
  items: RoadmapItem[]
  productId: string
  onAdd: (input: RoadmapItemInput) => Promise<void>
  onUpdate: (itemId: string, input: Partial<RoadmapItemInput>) => Promise<void>
  onDelete: (itemId: string) => Promise<void>
}

export function RoadmapSection({
  items,
  productId,
  onAdd,
  onUpdate,
  onDelete,
}: RoadmapSectionProps) {
  const { language } = useI18n()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const labels = STATUS_LABELS[language as 'ja' | 'en'] || STATUS_LABELS.ja

  const groupedItems = {
    planned: items.filter((i) => i.status === 'planned'),
    in_progress: items.filter((i) => i.status === 'in_progress'),
    completed: items.filter((i) => i.status === 'completed'),
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-translucent)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--info-bg-strong)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--info-light)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {language === 'en' ? 'Roadmap' : 'ロードマップ'}
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: 'var(--bg-surface-hover)',
              color: 'var(--text-muted)',
            }}
          >
            {items.length}
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
          style={{ color: 'var(--info)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'en' ? 'Add' : '追加'}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {items.length === 0 && !showAddForm ? (
          <div
            className="text-center py-8 rounded-xl"
            style={{
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border-default)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {language === 'en' ? 'No roadmap items yet' : 'ロードマップ項目がありません'}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-sm font-medium"
              style={{ color: 'var(--info)' }}
            >
              {language === 'en' ? 'Add first item' : '最初の項目を追加'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {showAddForm && (
              <RoadmapItemForm
                productId={productId}
                onSave={async (input) => {
                  await onAdd(input)
                  setShowAddForm(false)
                }}
                onCancel={() => setShowAddForm(false)}
                language={language}
                labels={labels}
              />
            )}

            {(['in_progress', 'planned', 'completed'] as const).map((status) => {
              const statusItems = groupedItems[status]
              if (statusItems.length === 0) return null

              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: ROADMAP_STATUS_COLORS[status] }}
                    />
                    <span
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {labels.roadmap[status]} ({statusItems.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {statusItems.map((item) => (
                      editingId === item.id ? (
                        <RoadmapItemForm
                          key={item.id}
                          productId={productId}
                          item={item}
                          onSave={async (input) => {
                            await onUpdate(item.id, input)
                            setEditingId(null)
                          }}
                          onCancel={() => setEditingId(null)}
                          language={language}
                          labels={labels}
                        />
                      ) : (
                        <RoadmapItemCard
                          key={item.id}
                          item={item}
                          labels={labels}
                          onEdit={() => setEditingId(item.id)}
                          onDelete={() => onDelete(item.id)}
                          onStatusChange={(status) => onUpdate(item.id, { status })}
                          language={language}
                        />
                      )
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Item Card
function RoadmapItemCard({
  item,
  labels,
  onEdit,
  onDelete,
  onStatusChange,
  language,
}: {
  item: RoadmapItem
  labels: typeof STATUS_LABELS.ja
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: RoadmapItem['status']) => void
  language: string
}) {
  const [showMenu, setShowMenu] = useState(false)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  return (
    <div
      className="relative rounded-xl p-4 transition-colors hover:bg-white/5"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
          style={{ background: ROADMAP_STATUS_COLORS[item.status] }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4
                className="font-medium text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.title}
              </h4>
              {item.description && (
                <p
                  className="text-xs mt-1 line-clamp-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded text-xs"
                  style={{
                    background: `${PRIORITY_COLORS[item.priority]}20`,
                    color: PRIORITY_COLORS[item.priority],
                  }}
                >
                  {labels.priority[item.priority]}
                </span>
                {item.quarter && (
                  <span
                    className="px-2 py-0.5 rounded text-xs"
                    style={{
                      background: 'var(--bg-surface-hover)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {item.quarter}
                  </span>
                )}
                {item.target_date && (
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {item.target_date}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="relative flex-shrink-0">
              <button
                ref={menuBtnRef}
                onClick={() => setShowMenu(!showMenu)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {showMenu && createPortal(
                <>
                  <div
                    className="fixed inset-0"
                    style={{ zIndex: 'var(--z-overlay)' }}
                    onClick={() => setShowMenu(false)}
                  />
                  <div
                    className="fixed w-40 rounded-xl overflow-hidden shadow-xl"
                    style={{
                      zIndex: 'var(--z-modal)',
                      top: menuBtnRef.current ? menuBtnRef.current.getBoundingClientRect().bottom + 4 : 0,
                      left: menuBtnRef.current ? menuBtnRef.current.getBoundingClientRect().right - 160 : 0,
                      background: 'var(--bg-overlay)',
                      border: '1px solid var(--border-default)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <button
                      onClick={() => {
                        onEdit()
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {language === 'en' ? 'Edit' : '編集'}
                    </button>
                    <div className="px-3 py-2" style={{ borderTop: '1px solid var(--border-default)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                        {language === 'en' ? 'Change status' : 'ステータス変更'}
                      </p>
                      <div className="space-y-1">
                        {(['planned', 'in_progress', 'completed', 'cancelled'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              onStatusChange(status)
                              setShowMenu(false)
                            }}
                            className={`w-full px-2 py-1.5 text-left text-xs rounded transition-colors hover:bg-white/10 flex items-center gap-2 ${
                              item.status === status ? 'bg-white/10' : ''
                            }`}
                            style={{ color: 'var(--text-primary)' }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: ROADMAP_STATUS_COLORS[status] }}
                            />
                            {labels.roadmap[status]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onDelete()
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 flex items-center gap-2"
                      style={{
                        color: 'var(--error-light)',
                        borderTop: '1px solid var(--border-default)',
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {language === 'en' ? 'Delete' : '削除'}
                    </button>
                  </div>
                </>,
                document.body
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Item Form
function RoadmapItemForm({
  productId,
  item,
  onSave,
  onCancel,
  language,
  labels,
}: {
  productId: string
  item?: RoadmapItem
  onSave: (input: RoadmapItemInput) => Promise<void>
  onCancel: () => void
  language: string
  labels: typeof STATUS_LABELS.ja
}) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<RoadmapItemInput>({
    product_id: productId,
    title: item?.title || '',
    description: item?.description || '',
    status: item?.status || 'planned',
    priority: item?.priority || 'medium',
    quarter: item?.quarter || '',
    target_date: item?.target_date || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

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
        background: 'var(--info-bg)',
        border: '1px solid var(--info-border)',
      }}
    >
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        className="input"
        placeholder={language === 'en' ? 'Item title' : '項目名'}
      />

      <textarea
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={2}
        className="textarea"
        placeholder={language === 'en' ? 'Description (optional)' : '説明（任意）'}
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as RoadmapItemInput['priority'] })}
          className="select"
        >
          <option value="low">{labels.priority.low}</option>
          <option value="medium">{labels.priority.medium}</option>
          <option value="high">{labels.priority.high}</option>
          <option value="critical">{labels.priority.critical}</option>
        </select>

        <input
          type="text"
          value={formData.quarter || ''}
          onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
          className="input"
          placeholder={language === 'en' ? 'Quarter (e.g., Q1 2025)' : '四半期（例: Q1 2025）'}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary flex-1 btn-sm"
        >
          {language === 'en' ? 'Cancel' : 'キャンセル'}
        </button>
        <button
          type="submit"
          disabled={saving || !formData.title.trim()}
          className="btn btn-sm flex-1"
          style={{
            background: 'var(--info)',
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
