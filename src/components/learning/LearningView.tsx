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

interface LearningViewProps {
  user: User
  categorySlug: string
  category: Category
  language: string
}

type LearningProps = {
  type?: string
  provider?: string
  status?: string
  rating?: number
  start_date?: string
  completion_date?: string
  notes?: string
}

const STATUS_GROUPS = ['Learning', 'Completed', 'Want to Learn'] as const

const STATUS_LABELS: Record<string, Record<string, string>> = {
  Learning: { en: 'Learning', ja: '学習中' },
  Completed: { en: 'Completed', ja: '完了' },
  'Want to Learn': { en: 'Want to Learn', ja: '学びたい' },
}

const STATUS_COLORS: Record<string, string> = {
  Learning: '#3b82f6',
  Completed: '#22c55e',
  'Want to Learn': '#f59e0b',
}

const TYPE_OPTIONS = ['Book', 'Course', 'Certification', 'Workshop'] as const

const TYPE_LABELS: Record<string, Record<string, string>> = {
  Book: { en: 'Book', ja: '書籍' },
  Course: { en: 'Course', ja: 'コース' },
  Certification: { en: 'Certification', ja: '資格' },
  Workshop: { en: 'Workshop', ja: 'ワークショップ' },
}

const TYPE_COLORS: Record<string, string> = {
  Book: '#8b5cf6',
  Course: '#3b82f6',
  Certification: '#f59e0b',
  Workshop: '#14b8a6',
}

export function LearningView({ user, categorySlug, language }: LearningViewProps) {
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
      console.error('Failed to load learning items:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, categorySlug, template])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async (title: string, props: LearningProps) => {
    if (!graphCategory) return
    if (editingNode) {
      await updateNode(editingNode.id, { title, properties: props })
    } else {
      await createNode(user.id, {
        category_id: graphCategory.id,
        node_type: 'LearningItem',
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

  // Group by status
  const grouped = STATUS_GROUPS.reduce((acc, group) => {
    acc[group] = nodes.filter((n) => {
      const s = (n.properties as LearningProps).status || 'Want to Learn'
      return s === group
    })
    return acc
  }, {} as Record<string, Node[]>)

  const completedCount = grouped['Completed'].length
  const inProgressCount = grouped['Learning'].length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>
            {language === 'en' ? 'Completed' : '完了'}
          </span>
          <span className="text-xl font-bold" style={{ color: '#22c55e' }}>{completedCount}</span>
        </div>
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>
            {language === 'en' ? 'In Progress' : '学習中'}
          </span>
          <span className="text-xl font-bold" style={{ color: '#3b82f6' }}>{inProgressCount}</span>
        </div>
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => { setEditingNode(null); setShowForm(true) }}
          className="btn btn-primary text-xs px-3 py-1.5"
        >
          <svg className="w-3.5 h-3.5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'en' ? 'Add Item' : '追加'}
        </button>
      </div>

      {/* Grouped cards */}
      {STATUS_GROUPS.map((group) => {
        const groupNodes = grouped[group]
        if (groupNodes.length === 0) return null
        const groupLabel = STATUS_LABELS[group]?.[language] || group
        const groupColor = STATUS_COLORS[group]

        return (
          <div key={group}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: groupColor }} />
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {groupLabel}
              </h3>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({groupNodes.length})</span>
            </div>
            <div className="space-y-2">
              {groupNodes.map((node) => (
                <LearningCard
                  key={node.id}
                  node={node}
                  language={language}
                  onEdit={() => { setEditingNode(node); setShowForm(true) }}
                  onDelete={() => handleDelete(node.id)}
                />
              ))}
            </div>
          </div>
        )
      })}

      {nodes.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)', opacity: 0.3 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {language === 'en' ? 'No learning items yet' : '学習アイテムがありません'}
          </p>
        </div>
      )}

      {showForm && createPortal(
        <LearningFormModal
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

// --- Learning Card ---
function LearningCard({ node, language, onEdit, onDelete }: {
  node: Node; language: string; onEdit: () => void; onDelete: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const props = node.properties as LearningProps
  const typeColor = TYPE_COLORS[props.type || 'Book'] || '#6b7280'
  const typeLabel = TYPE_LABELS[props.type || 'Book']?.[language] || props.type || ''

  return (
    <>
      <div
        className="rounded-xl p-4 transition-colors hover:bg-white/[0.02]"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {node.title}
              </h4>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                style={{ background: `${typeColor}20`, color: typeColor }}
              >
                {typeLabel}
              </span>
            </div>
            {props.provider && (
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{props.provider}</p>
            )}
            {props.rating != null && props.rating > 0 && (
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-3.5 h-3.5"
                    fill={star <= (props.rating || 0) ? '#f59e0b' : 'none'}
                    viewBox="0 0 24 24"
                    stroke={star <= (props.rating || 0) ? '#f59e0b' : 'var(--text-muted)'}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
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
              <button onClick={() => setShowConfirm(false)} className="btn btn-secondary flex-1">
                {language === 'en' ? 'Cancel' : 'キャンセル'}
              </button>
              <button onClick={() => { setShowConfirm(false); onDelete() }} className="btn btn-danger flex-1">
                {language === 'en' ? 'Delete' : '削除'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// --- Learning Form Modal ---
function LearningFormModal({ node, language, onSave, onClose }: {
  node: Node | null; language: string
  onSave: (title: string, props: LearningProps) => Promise<void>
  onClose: () => void
}) {
  const existingProps = (node?.properties || {}) as LearningProps
  const [title, setTitle] = useState(node?.title || '')
  const [type, setType] = useState(existingProps.type || 'Book')
  const [provider, setProvider] = useState(existingProps.provider || '')
  const [status, setStatus] = useState(existingProps.status || 'Want to Learn')
  const [rating, setRating] = useState(existingProps.rating || 0)
  const [startDate, setStartDate] = useState(existingProps.start_date || '')
  const [completionDate, setCompletionDate] = useState(existingProps.completion_date || '')
  const [notes, setNotes] = useState(existingProps.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave(title, { type, provider, status, rating, start_date: startDate, completion_date: completionDate, notes })
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative rounded-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {node ? (language === 'en' ? 'Edit Item' : 'アイテムを編集') : (language === 'en' ? 'New Learning Item' : '新規学習アイテム')}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">{language === 'en' ? 'Title' : 'タイトル'} *</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Type' : '種類'}</label>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]?.[language] || t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Provider' : '提供元'}</label>
            <input className="input" value={provider} onChange={(e) => setProvider(e.target.value)} />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Status' : 'ステータス'}</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_GROUPS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]?.[language] || s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Rating' : '評価'}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star === rating ? 0 : star)}
                  className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-white/10"
                >
                  <svg
                    className="w-5 h-5"
                    fill={star <= rating ? '#f59e0b' : 'none'}
                    viewBox="0 0 24 24"
                    stroke={star <= rating ? '#f59e0b' : 'var(--text-muted)'}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{language === 'en' ? 'Start Date' : '開始日'}</label>
              <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="label">{language === 'en' ? 'Completion Date' : '完了日'}</label>
              <input className="input" type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Notes' : 'メモ'}</label>
            <textarea className="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              {language === 'en' ? 'Cancel' : 'キャンセル'}
            </button>
            <button type="submit" disabled={saving || !title.trim()} className="btn btn-primary flex-1">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : (language === 'en' ? 'Save' : '保存')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
