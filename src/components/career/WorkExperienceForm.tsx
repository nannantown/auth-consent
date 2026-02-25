'use client'

import { useState } from 'react'
import type { Node } from '@/types/graph'

interface WorkExperienceFormProps {
  node?: Node | null
  onSave: (data: { title: string; properties: Record<string, unknown> }) => Promise<void>
  onCancel: () => void
  language: string
}

export function WorkExperienceForm({ node, onSave, onCancel, language }: WorkExperienceFormProps) {
  const props = (node?.properties || {}) as {
    company?: string
    role?: string
    start_date?: string
    end_date?: string
    description?: string
    achievements?: string
  }

  const [saving, setSaving] = useState(false)
  const [company, setCompany] = useState(props.company || '')
  const [role, setRole] = useState(props.role || '')
  const [startDate, setStartDate] = useState(props.start_date || '')
  const [endDate, setEndDate] = useState(props.end_date || '')
  const [isCurrent, setIsCurrent] = useState(!props.end_date && !!node)
  const [description, setDescription] = useState(props.description || '')
  const [achievements, setAchievements] = useState(props.achievements || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company.trim() || !role.trim() || !startDate) return

    setSaving(true)
    try {
      await onSave({
        title: `${role} @ ${company}`,
        properties: {
          company: company.trim(),
          role: role.trim(),
          start_date: startDate,
          end_date: isCurrent ? undefined : endDate || undefined,
          description: description.trim() || undefined,
          achievements: achievements.trim() || undefined,
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
      {/* Company */}
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {language === 'en' ? 'Company' : '会社名'} *
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          className="input"
          placeholder={language === 'en' ? 'Company name' : '会社名を入力'}
        />
      </div>

      {/* Role */}
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {language === 'en' ? 'Role / Title' : '役職'} *
        </label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          className="input"
          placeholder={language === 'en' ? 'e.g., Software Engineer' : '例: ソフトウェアエンジニア'}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {language === 'en' ? 'Start Date' : '開始年月'} *
          </label>
          <input
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="input"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {language === 'en' ? 'End Date' : '終了年月'}
          </label>
          <input
            type="month"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isCurrent}
            className="input"
            style={{ opacity: isCurrent ? 0.4 : 1 }}
          />
        </div>
      </div>

      {/* Currently working checkbox */}
      <label
        className="flex items-center gap-2 cursor-pointer"
        style={{ color: 'var(--text-secondary)' }}
      >
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => {
            setIsCurrent(e.target.checked)
            if (e.target.checked) setEndDate('')
          }}
          className="rounded"
          style={{ accentColor: '#3b82f6' }}
        />
        <span className="text-sm">
          {language === 'en' ? 'Currently working here' : '現在も在職中'}
        </span>
      </label>

      {/* Description */}
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {language === 'en' ? 'Description' : '業務内容'}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="textarea"
          placeholder={language === 'en' ? 'Describe your role and responsibilities' : '業務内容を記述'}
        />
      </div>

      {/* Achievements */}
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {language === 'en' ? 'Achievements' : '実績'}
        </label>
        <textarea
          value={achievements}
          onChange={(e) => setAchievements(e.target.value)}
          rows={2}
          className="textarea"
          placeholder={language === 'en' ? 'Key achievements and accomplishments' : '主な成果や達成事項'}
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
          disabled={saving || !company.trim() || !role.trim() || !startDate}
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
