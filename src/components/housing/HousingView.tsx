'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { User } from '@supabase/supabase-js'
import {
  getCategoryBySlug as getGraphCategoryBySlug,
  createCategory as createGraphCategory,
  getCategoryWithNodes,
  createNode,
  updateNode,
  deleteNode,
} from '@/lib/graph'
import { getTemplateBySlug } from '@/types/graph'
import type { Node, Category as GraphCategory } from '@/types/graph'
import type { Category } from '@/types/category'

interface HousingViewProps {
  user: User
  categorySlug: string
  category: Category
  language: string
}

type PropertyProps = {
  property_type?: string
  status?: string
  area?: number
  monthly_cost?: number
  address?: string
  move_in_date?: string
}

const PROPERTY_TYPES = ['Apartment', 'House', 'Condo', 'Room', 'Other'] as const
const STATUS_OPTIONS = ['Current', 'Previous', 'Target'] as const

const PROPERTY_TYPE_LABELS: Record<string, Record<string, string>> = {
  Apartment: { en: 'Apartment', ja: 'アパート' },
  House: { en: 'House', ja: '一戸建て' },
  Condo: { en: 'Condo', ja: 'マンション' },
  Room: { en: 'Room', ja: '部屋' },
  Other: { en: 'Other', ja: 'その他' },
}

const STATUS_LABELS: Record<string, Record<string, string>> = {
  Current: { en: 'Current', ja: '現在' },
  Previous: { en: 'Previous', ja: '以前' },
  Target: { en: 'Target', ja: '希望' },
}

const STATUS_COLORS: Record<string, string> = {
  Current: '#22c55e',
  Previous: '#6b7280',
  Target: '#3b82f6',
}

export function HousingView({ user, categorySlug, language }: HousingViewProps) {
  const [graphCategory, setGraphCategory] = useState<GraphCategory | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNode, setEditingNode] = useState<Node | null>(null)

  const template = getTemplateBySlug(categorySlug)

  const loadData = useCallback(async () => {
    try {
      let cat = await getGraphCategoryBySlug(user.id, categorySlug)
      if (!cat && template) {
        cat = await createGraphCategory(user.id, {
          slug: template.slug,
          name: template.name,
          name_en: template.name_en,
          icon: template.icon,
          color: template.color,
          description: template.description,
          template_slug: template.slug,
        })
      }
      if (cat) {
        setGraphCategory(cat)
        const result = await getCategoryWithNodes(cat.id)
        if (result) setNodes(result.nodes)
      }
    } catch (error) {
      console.error('Failed to load housing data:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, categorySlug, template])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async (title: string, props: PropertyProps) => {
    if (!graphCategory) return
    if (editingNode) {
      await updateNode(editingNode.id, { title, properties: props })
    } else {
      await createNode(user.id, {
        category_id: graphCategory.id,
        node_type: 'Property',
        title,
        properties: props,
      })
    }
    setShowForm(false)
    setEditingNode(null)
    loadData()
  }

  const handleDelete = async (nodeId: string) => {
    await deleteNode(nodeId)
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => { setEditingNode(null); setShowForm(true) }}
          className="btn btn-primary text-xs px-3 py-1.5"
        >
          <svg className="w-3.5 h-3.5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'en' ? 'Add Property' : '物件を追加'}
        </button>
      </div>

      {/* Property cards */}
      {nodes.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)', opacity: 0.3 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {language === 'en' ? 'No properties yet' : '物件がありません'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {nodes.map((node) => (
            <PropertyCard
              key={node.id}
              node={node}
              language={language}
              onEdit={() => { setEditingNode(node); setShowForm(true) }}
              onDelete={() => handleDelete(node.id)}
            />
          ))}
        </div>
      )}

      {showForm && createPortal(
        <PropertyFormModal
          node={editingNode}
          language={language}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingNode(null) }}
        />,
        document.body
      )}
    </div>
  )
}

// --- Property Card ---
function PropertyCard({ node, language, onEdit, onDelete }: {
  node: Node; language: string; onEdit: () => void; onDelete: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const props = node.properties as PropertyProps
  const statusColor = STATUS_COLORS[props.status || 'Current'] || '#6b7280'
  const statusLabel = STATUS_LABELS[props.status || 'Current']?.[language] || props.status || ''
  const typeLabel = PROPERTY_TYPE_LABELS[props.property_type || 'Other']?.[language] || props.property_type || ''

  return (
    <>
      <div
        className="rounded-xl p-4 transition-colors hover:bg-white/[0.02]"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {node.title}
              </h4>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                style={{ background: `${statusColor}20`, color: statusColor }}
              >
                {statusLabel}
              </span>
            </div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{typeLabel}</p>
            <div className="flex items-center gap-4 mt-2">
              {props.area != null && props.area > 0 && (
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {props.area}m\u00B2
                </span>
              )}
              {props.monthly_cost != null && props.monthly_cost > 0 && (
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'en' ? `\u00A5${props.monthly_cost.toLocaleString()}/mo` : `${props.monthly_cost.toLocaleString()}円/月`}
                </span>
              )}
              {props.address && (
                <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{props.address}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={onEdit} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={() => setShowConfirm(true)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      {showConfirm && createPortal(
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowConfirm(false)} />
          <div className="relative rounded-2xl p-6 max-w-sm w-full mx-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{language === 'en' ? 'Delete Property' : '物件を削除'}</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              {language === 'en' ? `Delete "${node.title}"?` : `「${node.title}」を削除しますか？`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn btn-secondary flex-1">{language === 'en' ? 'Cancel' : 'キャンセル'}</button>
              <button onClick={() => { setShowConfirm(false); onDelete() }} className="btn btn-danger flex-1">{language === 'en' ? 'Delete' : '削除'}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// --- Property Form Modal ---
function PropertyFormModal({ node, language, onSave, onClose }: {
  node: Node | null; language: string
  onSave: (title: string, props: PropertyProps) => Promise<void>
  onClose: () => void
}) {
  const existingProps = (node?.properties || {}) as PropertyProps
  const [title, setTitle] = useState(node?.title || '')
  const [propertyType, setPropertyType] = useState(existingProps.property_type || 'Apartment')
  const [status, setStatus] = useState(existingProps.status || 'Current')
  const [area, setArea] = useState(existingProps.area || 0)
  const [monthlyCost, setMonthlyCost] = useState(existingProps.monthly_cost || 0)
  const [address, setAddress] = useState(existingProps.address || '')
  const [moveInDate, setMoveInDate] = useState(existingProps.move_in_date || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave(title, { property_type: propertyType, status, area, monthly_cost: monthlyCost, address, move_in_date: moveInDate })
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative rounded-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {node ? (language === 'en' ? 'Edit Property' : '物件を編集') : (language === 'en' ? 'New Property' : '新規物件')}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">{language === 'en' ? 'Name' : '名前'} *</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Type' : '物件種類'}</label>
            <select className="select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]?.[language] || t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Status' : 'ステータス'}</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]?.[language] || s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Area (m\u00B2)' : '面積（m\u00B2）'}</label>
            <input className="input" type="number" value={area || ''} onChange={(e) => setArea(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Monthly Cost' : '月額費用'}</label>
            <input className="input" type="number" value={monthlyCost || ''} onChange={(e) => setMonthlyCost(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Address' : '住所'}</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Move-in Date' : '入居日'}</label>
            <input className="input" type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">{language === 'en' ? 'Cancel' : 'キャンセル'}</button>
            <button type="submit" disabled={saving || !title.trim()} className="btn btn-primary flex-1">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : (language === 'en' ? 'Save' : '保存')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
