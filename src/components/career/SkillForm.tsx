'use client'

import { useState } from 'react'
import type { Node } from '@/types/graph'

interface SkillFormProps {
  node?: Node | null
  onSave: (data: { title: string; properties: Record<string, unknown> }) => Promise<void>
  onCancel: () => void
  language: string
}

const SKILL_CATEGORIES = ['Programming', 'Language', 'Management', 'Design', 'Other'] as const

export function SkillForm({ node, onSave, onCancel, language }: SkillFormProps) {
  const props = (node?.properties || {}) as {
    category?: string
    proficiency?: number
    years?: number
  }

  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(node?.title || '')
  const [category, setCategory] = useState(props.category || 'Other')
  const [proficiency, setProficiency] = useState(props.proficiency || 3)
  const [years, setYears] = useState<string>(props.years?.toString() || '')

  const categoryLabels: Record<string, Record<string, string>> = {
    Programming: { en: 'Programming', ja: 'プログラミング' },
    Language: { en: 'Language', ja: '言語' },
    Management: { en: 'Management', ja: 'マネジメント' },
    Design: { en: 'Design', ja: 'デザイン' },
    Other: { en: 'Other', ja: 'その他' },
  }

  const proficiencyLabels: Record<number, Record<string, string>> = {
    1: { en: 'Beginner', ja: '初級' },
    2: { en: 'Elementary', ja: '初中級' },
    3: { en: 'Intermediate', ja: '中級' },
    4: { en: 'Advanced', ja: '上級' },
    5: { en: 'Expert', ja: 'エキスパート' },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        properties: {
          category,
          proficiency,
          years: years ? parseFloat(years) : undefined,
        },
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-4 space-y-4"
      style={{
        background: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.15)',
      }}
    >
      {/* Skill Name */}
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {language === 'en' ? 'Skill Name' : 'スキル名'} *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input"
          placeholder={language === 'en' ? 'e.g., TypeScript, Project Management' : '例: TypeScript、プロジェクト管理'}
        />
      </div>

      {/* Category */}
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {language === 'en' ? 'Category' : 'カテゴリ'}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select"
        >
          {SKILL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat]?.[language] || cat}
            </option>
          ))}
        </select>
      </div>

      {/* Proficiency */}
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {language === 'en' ? 'Proficiency' : '習熟度'}: {proficiencyLabels[proficiency]?.[language]}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setProficiency(level)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: level <= proficiency ? '#3b82f6' : 'var(--bg-surface-hover)',
                color: level <= proficiency ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${level <= proficiency ? '#3b82f6' : 'var(--border-subtle)'}`,
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Years */}
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {language === 'en' ? 'Years of Experience' : '経験年数'}
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          className="input"
          placeholder={language === 'en' ? 'e.g., 3' : '例: 3'}
        />
      </div>

      {/* Actions */}
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
          disabled={saving || !title.trim()}
          className="btn btn-sm flex-1"
          style={{
            background: '#3b82f6',
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
