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

interface BusinessViewProps {
  user: User
  categorySlug: string
  category: Category
  language: string
}

type BusinessProps = {
  role?: string
  equity_percent?: number
  status?: string
  valuation?: number
  founded?: string
}

const STATUS_OPTIONS = ['Active', 'Sold', 'Closed'] as const

const STATUS_LABELS: Record<string, Record<string, string>> = {
  Active: { en: 'Active', ja: '稼働中' },
  Sold: { en: 'Sold', ja: '売却済み' },
  Closed: { en: 'Closed', ja: '閉鎖' },
}

const STATUS_COLORS: Record<string, string> = {
  Active: '#22c55e',
  Sold: '#3b82f6',
  Closed: '#6b7280',
}

const ROLE_OPTIONS = ['Founder', 'Co-Founder', 'CEO', 'CTO', 'Partner', 'Investor', 'Advisor', 'Other'] as const

const ROLE_LABELS: Record<string, Record<string, string>> = {
  Founder: { en: 'Founder', ja: '創業者' },
  'Co-Founder': { en: 'Co-Founder', ja: '共同創業者' },
  CEO: { en: 'CEO', ja: 'CEO' },
  CTO: { en: 'CTO', ja: 'CTO' },
  Partner: { en: 'Partner', ja: 'パートナー' },
  Investor: { en: 'Investor', ja: '投資家' },
  Advisor: { en: 'Advisor', ja: 'アドバイザー' },
  Other: { en: 'Other', ja: 'その他' },
}

function formatValuation(value: number, language: string): string {
  if (language === 'ja') {
    if (value >= 100000000) return `${(value / 100000000).toFixed(1)}億円`
    if (value >= 10000) return `${(value / 10000).toFixed(0)}万円`
    return `${value.toLocaleString()}円`
  }
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

export function BusinessView({ user, categorySlug, language }: BusinessViewProps) {
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
      console.error('Failed to load business data:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, categorySlug, template])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async (title: string, props: BusinessProps) => {
    if (!graphCategory) return
    if (editingNode) {
      await updateNode(editingNode.id, { title, properties: props })
    } else {
      await createNode(user.id, {
        category_id: graphCategory.id,
        node_type: 'Business',
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
          {language === 'en' ? 'Add Business' : 'ビジネスを追加'}
        </button>
      </div>

      {/* Business cards */}
      {nodes.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)', opacity: 0.3 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {language === 'en' ? 'No businesses yet' : 'ビジネスがありません'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {nodes.map((node) => (
            <BusinessCard
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
        <BusinessFormModal
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

// --- Business Card ---
function BusinessCard({ node, language, onEdit, onDelete }: {
  node: Node; language: string; onEdit: () => void; onDelete: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const props = node.properties as BusinessProps
  const statusColor = STATUS_COLORS[props.status || 'Active'] || '#6b7280'
  const statusLabel = STATUS_LABELS[props.status || 'Active']?.[language] || props.status || ''
  const roleLabel = ROLE_LABELS[props.role || 'Other']?.[language] || props.role || ''

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
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{roleLabel}</p>
            <div className="flex items-center gap-4 mt-2">
              {props.equity_percent != null && props.equity_percent > 0 && (
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'en' ? `${props.equity_percent}% equity` : `持株 ${props.equity_percent}%`}
                </span>
              )}
              {props.valuation != null && props.valuation > 0 && (
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {formatValuation(props.valuation, language)}
                </span>
              )}
              {props.founded && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {language === 'en' ? `Founded ${props.founded}` : `設立 ${props.founded}`}
                </span>
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
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{language === 'en' ? 'Delete Business' : 'ビジネスを削除'}</h3>
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

// --- Business Form Modal ---
function BusinessFormModal({ node, language, onSave, onClose }: {
  node: Node | null; language: string
  onSave: (title: string, props: BusinessProps) => Promise<void>
  onClose: () => void
}) {
  const existingProps = (node?.properties || {}) as BusinessProps
  const [title, setTitle] = useState(node?.title || '')
  const [role, setRole] = useState(existingProps.role || 'Founder')
  const [equityPercent, setEquityPercent] = useState(existingProps.equity_percent || 0)
  const [status, setStatus] = useState(existingProps.status || 'Active')
  const [valuation, setValuation] = useState(existingProps.valuation || 0)
  const [founded, setFounded] = useState(existingProps.founded || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave(title, { role, equity_percent: equityPercent, status, valuation, founded })
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative rounded-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {node ? (language === 'en' ? 'Edit Business' : 'ビジネスを編集') : (language === 'en' ? 'New Business' : '新規ビジネス')}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">{language === 'en' ? 'Company Name' : '会社名'} *</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Role' : '役職'}</label>
            <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]?.[language] || r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Status' : 'ステータス'}</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]?.[language] || s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Equity %' : '持株比率 %'}</label>
            <input className="input" type="number" min={0} max={100} step={0.1} value={equityPercent || ''} onChange={(e) => setEquityPercent(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Valuation' : '評価額'}</label>
            <input className="input" type="number" value={valuation || ''} onChange={(e) => setValuation(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Founded' : '設立年'}</label>
            <input className="input" value={founded} onChange={(e) => setFounded(e.target.value)} placeholder="2020" />
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
