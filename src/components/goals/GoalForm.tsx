'use client'

import { useState } from 'react'
import type { Node } from '@/types/graph'
import type { GoalProperties, GoalStatus } from '@/types/goals'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@ground/ui'

interface GoalFormState {
  description: string
  status: GoalStatus
  progress: number
  category: string
  deadline: string
  milestones: Array<{ title: string; completed: boolean }>
}

interface GoalFormProps {
  goal?: Node | null
  onSave: (title: string, properties: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  language: string
}

const DEFAULT_PROPERTIES: GoalFormState = {
  description: '',
  status: 'not_started',
  progress: 0,
  category: 'personal',
  deadline: '',
  milestones: [],
}

export function GoalForm({ goal, onSave, onCancel, language }: GoalFormProps) {
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(goal?.title || '')
  const [properties, setProperties] = useState<GoalFormState>(() => {
    if (goal?.properties) {
      const p = goal.properties as GoalProperties
      return {
        description: p.description || '',
        status: p.status || 'not_started',
        progress: p.progress ?? 0,
        category: p.category || 'personal',
        deadline: p.deadline || '',
        milestones: p.milestones || [],
      }
    }
    return { ...DEFAULT_PROPERTIES }
  })

  const isEdit = !!goal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    try {
      await onSave(title.trim(), properties)
    } finally {
      setSaving(false)
    }
  }

  const addMilestone = () => {
    setProperties({
      ...properties,
      milestones: [...(properties.milestones || []), { title: '', completed: false }],
    })
  }

  const updateMilestone = (index: number, updates: Partial<{ title: string; completed: boolean }>) => {
    const milestones = [...(properties.milestones || [])]
    milestones[index] = { ...milestones[index], ...updates }
    setProperties({ ...properties, milestones })
  }

  const removeMilestone = (index: number) => {
    const milestones = [...(properties.milestones || [])]
    milestones.splice(index, 1)
    setProperties({ ...properties, milestones })
  }

  const statusOptions = [
    { value: 'not_started', label: language === 'en' ? 'Not Started' : '未着手' },
    { value: 'in_progress', label: language === 'en' ? 'In Progress' : '進行中' },
    { value: 'completed', label: language === 'en' ? 'Completed' : '完了' },
    { value: 'abandoned', label: language === 'en' ? 'Abandoned' : '中止' },
  ]

  const categoryOptions = [
    { value: 'personal', label: language === 'en' ? 'Personal' : '個人' },
    { value: 'professional', label: language === 'en' ? 'Professional' : '仕事' },
    { value: 'health', label: language === 'en' ? 'Health' : '健康' },
    { value: 'financial', label: language === 'en' ? 'Financial' : '財務' },
    { value: 'other', label: language === 'en' ? 'Other' : 'その他' },
  ]

  return (
    <Modal open={true} onClose={onCancel} size="lg" showClose>
      <ModalHeader>
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          {isEdit
            ? (language === 'en' ? 'Edit Goal' : '目標を編集')
            : (language === 'en' ? 'New Goal' : '新しい目標')}
        </h3>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Title */}
            <div>
              <label className="label mb-2">
                {language === 'en' ? 'Goal Title' : '目標名'} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="input"
                placeholder={language === 'en' ? 'What do you want to achieve?' : '何を達成したいですか？'}
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="label mb-2">
                {language === 'en' ? 'Description' : '説明'}
              </label>
              <textarea
                value={properties.description || ''}
                onChange={(e) => setProperties({ ...properties, description: e.target.value })}
                rows={3}
                className="textarea"
                placeholder={language === 'en' ? 'Describe your goal in detail' : '目標の詳細を記述'}
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label mb-2">
                  {language === 'en' ? 'Category' : 'カテゴリ'}
                </label>
                <select
                  value={properties.category}
                  onChange={(e) => setProperties({ ...properties, category: e.target.value })}
                  className="select"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label mb-2">
                  {language === 'en' ? 'Status' : 'ステータス'}
                </label>
                <select
                  value={properties.status}
                  onChange={(e) => setProperties({ ...properties, status: e.target.value as GoalStatus })}
                  className="select"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="label mb-2">
                {language === 'en' ? 'Deadline' : '期限'}
              </label>
              <input
                type="date"
                value={properties.deadline || ''}
                onChange={(e) => setProperties({ ...properties, deadline: e.target.value })}
                className="input"
              />
            </div>

            {/* Progress */}
            <div>
              <label className="label mb-2">
                {language === 'en' ? 'Progress' : '進捗'}: {properties.progress}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={properties.progress}
                onChange={(e) => setProperties({ ...properties, progress: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: 'var(--success)' }}
              />
              <div
                className="flex justify-between text-xs mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label">
                  {language === 'en' ? 'Milestones' : 'マイルストーン'}
                </label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {language === 'en' ? 'Add' : '追加'}
                </button>
              </div>
              {(properties.milestones || []).length > 0 && (
                <div className="space-y-2">
                  {(properties.milestones || []).map((milestone, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateMilestone(index, { completed: !milestone.completed })}
                        className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-colors"
                        style={{
                          border: milestone.completed ? 'none' : '1.5px solid var(--border-default)',
                          background: milestone.completed ? 'var(--success)' : 'transparent',
                        }}
                      >
                        {milestone.completed && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, { title: e.target.value })}
                        className="input flex-1"
                        placeholder={language === 'en' ? 'Milestone title' : 'マイルストーン名'}
                        style={{
                          textDecoration: milestone.completed ? 'line-through' : 'none',
                          opacity: milestone.completed ? 0.6 : 1,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 flex-shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary flex-1"
          >
            {language === 'en' ? 'Cancel' : 'キャンセル'}
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="btn btn-primary flex-1"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              </span>
            ) : (
              language === 'en' ? 'Save' : '保存'
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
