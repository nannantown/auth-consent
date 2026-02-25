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

interface LifestyleViewProps {
  user: User
  categorySlug: string
  category: Category
  language: string
}

type HobbyProps = {
  category?: string
  frequency?: string
  since?: string
  skill_level?: string
}

const HOBBY_CATEGORIES = ['Sports', 'Music', 'Art', 'Cooking', 'Gaming', 'Reading', 'Travel', 'Other'] as const

const HOBBY_CATEGORY_LABELS: Record<string, Record<string, string>> = {
  Sports: { en: 'Sports', ja: 'スポーツ' },
  Music: { en: 'Music', ja: '音楽' },
  Art: { en: 'Art', ja: 'アート' },
  Cooking: { en: 'Cooking', ja: '料理' },
  Gaming: { en: 'Gaming', ja: 'ゲーム' },
  Reading: { en: 'Reading', ja: '読書' },
  Travel: { en: 'Travel', ja: '旅行' },
  Other: { en: 'Other', ja: 'その他' },
}

const HOBBY_CATEGORY_COLORS: Record<string, string> = {
  Sports: '#22c55e',
  Music: '#8b5cf6',
  Art: '#ec4899',
  Cooking: '#f97316',
  Gaming: '#3b82f6',
  Reading: '#14b8a6',
  Travel: '#eab308',
  Other: '#6b7280',
}

const FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Occasionally'] as const

const FREQUENCY_LABELS: Record<string, Record<string, string>> = {
  Daily: { en: 'Daily', ja: '毎日' },
  Weekly: { en: 'Weekly', ja: '毎週' },
  Monthly: { en: 'Monthly', ja: '月1回' },
  Occasionally: { en: 'Occasionally', ja: 'たまに' },
}

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const

const SKILL_LABELS: Record<string, Record<string, string>> = {
  Beginner: { en: 'Beginner', ja: '初心者' },
  Intermediate: { en: 'Intermediate', ja: '中級' },
  Advanced: { en: 'Advanced', ja: '上級' },
  Expert: { en: 'Expert', ja: 'エキスパート' },
}

const SKILL_LEVEL_INDEX: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
}

export function LifestyleView({ user, categorySlug, language }: LifestyleViewProps) {
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
      console.error('Failed to load lifestyle data:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, categorySlug, template])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async (title: string, props: HobbyProps) => {
    if (!graphCategory) return
    if (editingNode) {
      await updateNode(editingNode.id, { title, properties: props })
    } else {
      await createNode(user.id, {
        category_id: graphCategory.id,
        node_type: 'Hobby',
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
          {language === 'en' ? 'Add Hobby' : '趣味を追加'}
        </button>
      </div>

      {/* Hobby cards grid */}
      {nodes.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)', opacity: 0.3 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {language === 'en' ? 'No hobbies yet' : '趣味がありません'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {nodes.map((node) => (
            <HobbyCard
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
        <HobbyFormModal
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

// --- Hobby Card ---
function HobbyCard({ node, language, onEdit, onDelete }: {
  node: Node; language: string; onEdit: () => void; onDelete: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const props = node.properties as HobbyProps
  const catColor = HOBBY_CATEGORY_COLORS[props.category || 'Other'] || '#6b7280'
  const catLabel = HOBBY_CATEGORY_LABELS[props.category || 'Other']?.[language] || props.category || ''
  const freqLabel = FREQUENCY_LABELS[props.frequency || '']?.[language] || props.frequency || ''
  const skillLabel = SKILL_LABELS[props.skill_level || '']?.[language] || props.skill_level || ''
  const skillIndex = SKILL_LEVEL_INDEX[props.skill_level || ''] || 0

  return (
    <>
      <div
        className="rounded-xl p-4 transition-colors hover:bg-white/[0.02]"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {node.title}
              </h4>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                style={{ background: `${catColor}20`, color: catColor }}
              >
                {catLabel}
              </span>
            </div>

            {freqLabel && (
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{freqLabel}</p>
            )}

            {/* Skill level indicator */}
            {skillIndex > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="w-5 h-1.5 rounded-full"
                      style={{
                        background: level <= skillIndex ? catColor : 'var(--bg-surface-hover)',
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{skillLabel}</span>
              </div>
            )}

            {props.since && (
              <span className="text-[10px] mt-1 block" style={{ color: 'var(--text-muted)' }}>
                {language === 'en' ? `Since ${props.since}` : `${props.since}から`}
              </span>
            )}
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
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{language === 'en' ? 'Delete Hobby' : '趣味を削除'}</h3>
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

// --- Hobby Form Modal ---
function HobbyFormModal({ node, language, onSave, onClose }: {
  node: Node | null; language: string
  onSave: (title: string, props: HobbyProps) => Promise<void>
  onClose: () => void
}) {
  const existingProps = (node?.properties || {}) as HobbyProps
  const [title, setTitle] = useState(node?.title || '')
  const [hobbyCategory, setHobbyCategory] = useState(existingProps.category || 'Other')
  const [frequency, setFrequency] = useState(existingProps.frequency || '')
  const [since, setSince] = useState(existingProps.since || '')
  const [skillLevel, setSkillLevel] = useState(existingProps.skill_level || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave(title, { category: hobbyCategory, frequency, since, skill_level: skillLevel })
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative rounded-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {node ? (language === 'en' ? 'Edit Hobby' : '趣味を編集') : (language === 'en' ? 'New Hobby' : '新規趣味')}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">{language === 'en' ? 'Name' : '名前'} *</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Category' : 'カテゴリ'}</label>
            <select className="select" value={hobbyCategory} onChange={(e) => setHobbyCategory(e.target.value)}>
              {HOBBY_CATEGORIES.map((c) => <option key={c} value={c}>{HOBBY_CATEGORY_LABELS[c]?.[language] || c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Frequency' : '頻度'}</label>
            <select className="select" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="">{language === 'en' ? 'Select...' : '選択...'}</option>
              {FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]?.[language] || f}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Since' : '開始時期'}</label>
            <input className="input" value={since} onChange={(e) => setSince(e.target.value)} placeholder="2020" />
          </div>
          <div>
            <label className="label">{language === 'en' ? 'Skill Level' : 'スキルレベル'}</label>
            <select className="select" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
              <option value="">{language === 'en' ? 'Select...' : '選択...'}</option>
              {SKILL_LEVELS.map((s) => <option key={s} value={s}>{SKILL_LABELS[s]?.[language] || s}</option>)}
            </select>
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
