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

interface ContactsViewProps {
  user: User
  categorySlug: string
  category: Category
  language: string
}

type ContactProps = {
  relationship?: string
  company?: string
  role?: string
  email?: string
  phone?: string
  notes?: string
}

const RELATIONSHIP_GROUPS = ['Family', 'Friend', 'Colleague', 'Mentor', 'Other'] as const

const RELATIONSHIP_LABELS: Record<string, Record<string, string>> = {
  Family: { en: 'Family', ja: '家族' },
  Friend: { en: 'Friend', ja: '友人' },
  Colleague: { en: 'Colleague', ja: '同僚' },
  Mentor: { en: 'Mentor', ja: 'メンター' },
  Other: { en: 'Other', ja: 'その他' },
}

const RELATIONSHIP_COLORS: Record<string, string> = {
  Family: '#ec4899',
  Friend: '#8b5cf6',
  Colleague: '#3b82f6',
  Mentor: '#f59e0b',
  Other: '#6b7280',
}

export function ContactsView({ user, categorySlug, language }: ContactsViewProps) {
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
      console.error('Failed to load contacts:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, categorySlug, template])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async (title: string, props: ContactProps) => {
    if (!graphCategory) return
    if (editingNode) {
      await updateNode(editingNode.id, { title, properties: props })
    } else {
      await createNode(user.id, {
        category_id: graphCategory.id,
        node_type: 'Contact',
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

  // Group by relationship
  const grouped = RELATIONSHIP_GROUPS.reduce((acc, group) => {
    acc[group] = nodes.filter((n) => {
      const rel = (n.properties as ContactProps).relationship || 'Other'
      return rel === group
    })
    return acc
  }, {} as Record<string, Node[]>)

  // Stats
  const totalContacts = nodes.length
  const byCategoryCount = RELATIONSHIP_GROUPS.map((g) => ({
    label: RELATIONSHIP_LABELS[g]?.[language] || g,
    count: grouped[g].length,
    color: RELATIONSHIP_COLORS[g],
  })).filter((s) => s.count > 0)

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
      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>
            {language === 'en' ? 'Total Contacts' : '連絡先数'}
          </span>
          <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {totalContacts}
          </span>
        </div>
        {byCategoryCount.map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-4 py-3"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
            <span className="text-xl font-bold" style={{ color: s.color }}>{s.count}</span>
          </div>
        ))}
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
          {language === 'en' ? 'Add Contact' : '連絡先を追加'}
        </button>
      </div>

      {/* Grouped contact cards */}
      {RELATIONSHIP_GROUPS.map((group) => {
        const groupNodes = grouped[group]
        if (groupNodes.length === 0) return null
        const groupLabel = RELATIONSHIP_LABELS[group]?.[language] || group
        const groupColor = RELATIONSHIP_COLORS[group]

        return (
          <div key={group}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: groupColor }} />
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {groupLabel}
              </h3>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ({groupNodes.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {groupNodes.map((node) => (
                <ContactCard
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {language === 'en' ? 'No contacts yet' : '連絡先がありません'}
          </p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && createPortal(
        <ContactFormModal
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

// --- Contact Card ---
function ContactCard({ node, language, onEdit, onDelete }: {
  node: Node
  language: string
  onEdit: () => void
  onDelete: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const props = node.properties as ContactProps
  const relColor = RELATIONSHIP_COLORS[props.relationship || 'Other'] || '#6b7280'
  const relLabel = RELATIONSHIP_LABELS[props.relationship || 'Other']?.[language] || props.relationship || ''

  return (
    <>
      <div
        className="rounded-xl p-4 transition-colors hover:bg-white/[0.02]"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {node.title}
              </h4>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                style={{ background: `${relColor}20`, color: relColor }}
              >
                {relLabel}
              </span>
            </div>

            {(props.company || props.role) && (
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                {[props.role, props.company].filter(Boolean).join(' @ ')}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2">
              {props.email && (
                <a
                  href={`mailto:${props.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {props.email}
                </a>
              )}
              {props.phone && (
                <a
                  href={`tel:${props.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {props.phone}
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowConfirm(true) }}
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
          <div
            className="relative rounded-2xl p-6 max-w-sm w-full mx-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
          >
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {language === 'en' ? 'Delete Contact' : '連絡先を削除'}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              {language === 'en'
                ? `Delete "${node.title}"? This action cannot be undone.`
                : `「${node.title}」を削除しますか？この操作は取り消せません。`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn btn-secondary flex-1">
                {language === 'en' ? 'Cancel' : 'キャンセル'}
              </button>
              <button
                onClick={() => { setShowConfirm(false); onDelete() }}
                className="btn btn-danger flex-1"
              >
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

// --- Contact Form Modal ---
function ContactFormModal({ node, language, onSave, onClose }: {
  node: Node | null
  language: string
  onSave: (title: string, props: ContactProps) => Promise<void>
  onClose: () => void
}) {
  const existingProps = (node?.properties || {}) as ContactProps
  const [title, setTitle] = useState(node?.title || '')
  const [relationship, setRelationship] = useState(existingProps.relationship || 'Other')
  const [company, setCompany] = useState(existingProps.company || '')
  const [role, setRole] = useState(existingProps.role || '')
  const [email, setEmail] = useState(existingProps.email || '')
  const [phone, setPhone] = useState(existingProps.phone || '')
  const [notes, setNotes] = useState(existingProps.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave(title, { relationship, company, role, email, phone, notes })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative rounded-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
      >
        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {node
              ? (language === 'en' ? 'Edit Contact' : '連絡先を編集')
              : (language === 'en' ? 'New Contact' : '新規連絡先')}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">{language === 'en' ? 'Name' : '名前'} *</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Relationship' : '関係'}</label>
            <select className="select" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
              {RELATIONSHIP_GROUPS.map((g) => (
                <option key={g} value={g}>{RELATIONSHIP_LABELS[g]?.[language] || g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Company' : '会社名'}</label>
            <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Role' : '役職'}</label>
            <input className="input" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Email' : 'メール'}</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Phone' : '電話番号'}</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (language === 'en' ? 'Save' : '保存')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
