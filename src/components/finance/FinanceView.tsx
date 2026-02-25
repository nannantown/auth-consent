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

interface FinanceViewProps {
  user: User
  categorySlug: string
  category: Category
  language: string
}

type AssetProps = {
  asset_type?: string
  value?: number
  currency?: string
  notes?: string
}

type FinanceRecordProps = {
  record_type?: string
  amount?: number
  currency?: string
  date?: string
  notes?: string
}

const ASSET_TYPES = ['Cash', 'Stock', 'Real Estate', 'Crypto', 'Bond', 'Other'] as const
const RECORD_TYPES = ['Income', 'Expense', 'Investment', 'Saving', 'Other'] as const

const ASSET_TYPE_LABELS: Record<string, Record<string, string>> = {
  Cash: { en: 'Cash', ja: '現金' },
  Stock: { en: 'Stock', ja: '株式' },
  'Real Estate': { en: 'Real Estate', ja: '不動産' },
  Crypto: { en: 'Crypto', ja: '暗号資産' },
  Bond: { en: 'Bond', ja: '債券' },
  Other: { en: 'Other', ja: 'その他' },
}

const RECORD_TYPE_LABELS: Record<string, Record<string, string>> = {
  Income: { en: 'Income', ja: '収入' },
  Expense: { en: 'Expense', ja: '支出' },
  Investment: { en: 'Investment', ja: '投資' },
  Saving: { en: 'Saving', ja: '貯蓄' },
  Other: { en: 'Other', ja: 'その他' },
}

const ASSET_TYPE_COLORS: Record<string, string> = {
  Cash: '#22c55e',
  Stock: '#3b82f6',
  'Real Estate': '#f97316',
  Crypto: '#8b5cf6',
  Bond: '#eab308',
  Other: '#6b7280',
}

function formatCurrency(value: number, currency: string = 'JPY'): string {
  try {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

export function FinanceView({ user, categorySlug, language }: FinanceViewProps) {
  const [graphCategory, setGraphCategory] = useState<GraphCategory | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'assets' | 'records'>('assets')
  const [showForm, setShowForm] = useState(false)
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const [formType, setFormType] = useState<'Asset' | 'FinanceRecord'>('Asset')

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
      console.error('Failed to load finance data:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, categorySlug, template])

  useEffect(() => { loadData() }, [loadData])

  const assets = nodes.filter((n) => n.node_type === 'Asset')
  const records = nodes.filter((n) => n.node_type === 'FinanceRecord')

  const netWorth = assets.reduce((sum, n) => {
    const v = (n.properties as AssetProps).value || 0
    return sum + v
  }, 0)

  const defaultCurrency = assets.length > 0
    ? ((assets[0].properties as AssetProps).currency || 'JPY')
    : 'JPY'

  const handleSave = async (title: string, nodeType: string, props: Record<string, unknown>) => {
    if (!graphCategory) return
    if (editingNode) {
      await updateNode(editingNode.id, { title, properties: props })
    } else {
      await createNode(user.id, {
        category_id: graphCategory.id,
        node_type: nodeType,
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

  const openAddForm = (type: 'Asset' | 'FinanceRecord') => {
    setFormType(type)
    setEditingNode(null)
    setShowForm(true)
  }

  const openEditForm = (node: Node) => {
    setFormType(node.node_type as 'Asset' | 'FinanceRecord')
    setEditingNode(node)
    setShowForm(true)
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
      {/* Net worth summary */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <span className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
          {language === 'en' ? 'Net Worth' : '純資産'}
        </span>
        <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {formatCurrency(netWorth, defaultCurrency)}
        </span>
      </div>

      {/* Tab toggle */}
      <div
        className="flex items-center rounded-md overflow-hidden inline-flex"
        style={{ border: '1px solid var(--border-default)' }}
      >
        {(['assets', 'records'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 text-xs font-medium transition-colors"
            style={{
              background: activeTab === tab ? 'var(--selected-bg)' : 'transparent',
              color: activeTab === tab ? 'var(--selected-text)' : 'var(--text-muted)',
            }}
          >
            {tab === 'assets'
              ? (language === 'en' ? 'Assets' : '資産')
              : (language === 'en' ? 'Records' : '記録')}
          </button>
        ))}
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => openAddForm(activeTab === 'assets' ? 'Asset' : 'FinanceRecord')}
          className="btn btn-primary text-xs px-3 py-1.5"
        >
          <svg className="w-3.5 h-3.5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'en' ? 'Add' : '追加'}
        </button>
      </div>

      {/* Assets tab */}
      {activeTab === 'assets' && (
        <div className="space-y-2">
          {assets.length === 0 ? (
            <EmptyState language={language} type="assets" />
          ) : (
            assets.map((node) => {
              const props = node.properties as AssetProps
              const typeColor = ASSET_TYPE_COLORS[props.asset_type || 'Other'] || '#6b7280'
              const typeLabel = ASSET_TYPE_LABELS[props.asset_type || 'Other']?.[language] || props.asset_type || ''
              return (
                <ItemCard
                  key={node.id}
                  node={node}
                  language={language}
                  badge={{ label: typeLabel, color: typeColor }}
                  detail={props.value != null ? formatCurrency(props.value, props.currency || defaultCurrency) : undefined}
                  onEdit={() => openEditForm(node)}
                  onDelete={() => handleDelete(node.id)}
                />
              )
            })
          )}
        </div>
      )}

      {/* Records tab */}
      {activeTab === 'records' && (
        <div className="space-y-2">
          {records.length === 0 ? (
            <EmptyState language={language} type="records" />
          ) : (
            records.map((node) => {
              const props = node.properties as FinanceRecordProps
              const typeLabel = RECORD_TYPE_LABELS[props.record_type || 'Other']?.[language] || props.record_type || ''
              return (
                <ItemCard
                  key={node.id}
                  node={node}
                  language={language}
                  badge={{ label: typeLabel, color: '#eab308' }}
                  detail={props.amount != null ? formatCurrency(props.amount, props.currency || defaultCurrency) : undefined}
                  subDetail={props.date}
                  onEdit={() => openEditForm(node)}
                  onDelete={() => handleDelete(node.id)}
                />
              )
            })
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && createPortal(
        <FinanceFormModal
          node={editingNode}
          formType={formType}
          language={language}
          defaultCurrency={defaultCurrency}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingNode(null) }}
        />,
        document.body
      )}
    </div>
  )
}

// --- Shared Item Card ---
function ItemCard({ node, language, badge, detail, subDetail, onEdit, onDelete }: {
  node: Node; language: string
  badge: { label: string; color: string }
  detail?: string; subDetail?: string
  onEdit: () => void; onDelete: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <div
        className="rounded-xl p-4 transition-colors hover:bg-white/[0.02]"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{node.title}</h4>
              <span className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0" style={{ background: `${badge.color}20`, color: badge.color }}>{badge.label}</span>
            </div>
            {detail && <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{detail}</p>}
            {subDetail && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subDetail}</p>}
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
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {language === 'en' ? 'Delete Item' : 'アイテムを削除'}
            </h3>
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

function EmptyState({ language, type }: { language: string; type: string }) {
  return (
    <div className="text-center py-12">
      <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)', opacity: 0.3 }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {language === 'en' ? `No ${type} yet` : `${type === 'assets' ? '資産' : '記録'}がありません`}
      </p>
    </div>
  )
}

// --- Finance Form Modal ---
function FinanceFormModal({ node, formType, language, defaultCurrency, onSave, onClose }: {
  node: Node | null; formType: 'Asset' | 'FinanceRecord'
  language: string; defaultCurrency: string
  onSave: (title: string, nodeType: string, props: Record<string, unknown>) => Promise<void>
  onClose: () => void
}) {
  const existingProps = (node?.properties || {}) as Record<string, unknown>
  const [title, setTitle] = useState(node?.title || '')
  const [saving, setSaving] = useState(false)

  // Asset fields
  const [assetType, setAssetType] = useState((existingProps.asset_type as string) || 'Cash')
  const [value, setValue] = useState((existingProps.value as number) || 0)
  const [currency, setCurrency] = useState((existingProps.currency as string) || defaultCurrency)

  // FinanceRecord fields
  const [recordType, setRecordType] = useState((existingProps.record_type as string) || 'Income')
  const [amount, setAmount] = useState((existingProps.amount as number) || 0)
  const [recCurrency, setRecCurrency] = useState((existingProps.currency as string) || defaultCurrency)
  const [date, setDate] = useState((existingProps.date as string) || '')

  const [notes, setNotes] = useState((existingProps.notes as string) || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      if (formType === 'Asset') {
        await onSave(title, 'Asset', { asset_type: assetType, value, currency, notes })
      } else {
        await onSave(title, 'FinanceRecord', { record_type: recordType, amount, currency: recCurrency, date, notes })
      }
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative rounded-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {node
              ? (language === 'en' ? 'Edit' : '編集')
              : (formType === 'Asset'
                ? (language === 'en' ? 'New Asset' : '新規資産')
                : (language === 'en' ? 'New Record' : '新規記録'))}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">{language === 'en' ? 'Name' : '名前'} *</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          {formType === 'Asset' ? (
            <>
              <div>
                <label className="label">{language === 'en' ? 'Asset Type' : '資産種類'}</label>
                <select className="select" value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                  {ASSET_TYPES.map((t) => <option key={t} value={t}>{ASSET_TYPE_LABELS[t]?.[language] || t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{language === 'en' ? 'Value' : '金額'}</label>
                <input className="input" type="number" value={value || ''} onChange={(e) => setValue(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">{language === 'en' ? 'Currency' : '通貨'}</label>
                <input className="input" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="JPY" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="label">{language === 'en' ? 'Record Type' : '記録種類'}</label>
                <select className="select" value={recordType} onChange={(e) => setRecordType(e.target.value)}>
                  {RECORD_TYPES.map((t) => <option key={t} value={t}>{RECORD_TYPE_LABELS[t]?.[language] || t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{language === 'en' ? 'Amount' : '金額'}</label>
                <input className="input" type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">{language === 'en' ? 'Currency' : '通貨'}</label>
                <input className="input" value={recCurrency} onChange={(e) => setRecCurrency(e.target.value)} placeholder="JPY" />
              </div>
              <div>
                <label className="label">{language === 'en' ? 'Date' : '日付'}</label>
                <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </>
          )}

          <div>
            <label className="label">{language === 'en' ? 'Notes' : 'メモ'}</label>
            <textarea className="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
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
