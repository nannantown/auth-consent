'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/lib/i18n'
import {
  HABIT_CHAPTERS,
  HABIT_CHAPTER_LABELS,
  HABIT_FREQUENCIES,
  HABIT_FREQUENCY_LABELS,
  HABIT_PRINCIPLES,
  HABIT_PRINCIPLE_LABELS,
} from '@/types/graph'
import type { Node } from '@/types/graph'
import type { HabitChapter, HabitFrequency, HabitPrinciple } from '@/types/graph'

interface HabitFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    properties: Record<string, unknown>
  }) => void
  node?: Node
}

export function HabitFormModal({ isOpen, onClose, onSave, node }: HabitFormModalProps) {
  const { t, language } = useI18n()

  const [title, setTitle] = useState('')
  const [chapter, setChapter] = useState<HabitChapter>(HABIT_CHAPTERS.work)
  const [frequency, setFrequency] = useState<HabitFrequency>(HABIT_FREQUENCIES.daily)
  const [principle, setPrinciple] = useState<HabitPrinciple>(HABIT_PRINCIPLES.act_first)
  const [evidence, setEvidence] = useState('')
  const [trigger, setTrigger] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (node) {
        const props = node.properties as Record<string, unknown>
        setTitle(node.title || '')
        setChapter((props.chapter as HabitChapter) || HABIT_CHAPTERS.work)
        setFrequency((props.frequency as HabitFrequency) || HABIT_FREQUENCIES.daily)
        setPrinciple((props.principle as HabitPrinciple) || HABIT_PRINCIPLES.act_first)
        setEvidence((props.evidence as string) || '')
        setTrigger((props.trigger as string) || '')
      } else {
        setTitle('')
        setChapter(HABIT_CHAPTERS.work)
        setFrequency(HABIT_FREQUENCIES.daily)
        setPrinciple(HABIT_PRINCIPLES.act_first)
        setEvidence('')
        setTrigger('')
      }
    }
  }, [node, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      properties: {
        ...(node?.properties || {}),
        chapter,
        frequency,
        principle,
        evidence: evidence.trim() || undefined,
        trigger: trigger.trim() || undefined,
        is_active: true,
        streak: (node?.properties as Record<string, unknown>)?.streak ?? 0,
        best_streak: (node?.properties as Record<string, unknown>)?.best_streak ?? 0,
        completed_dates: (node?.properties as Record<string, unknown>)?.completed_dates ?? [],
      },
    })
  }

  if (!isOpen) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-xl overflow-hidden animate-scale-in"
          style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-default)',
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {node ? t.habits.editHabit : t.habits.addHabit}
            </h2>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            {/* Habit name */}
            <div>
              <label className="label">{t.habits.habitName}</label>
              <input
                className="input mt-1"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder={t.habits.habitNamePlaceholder}
                maxLength={200}
                autoFocus
              />
            </div>

            {/* Chapter */}
            <div>
              <label className="label">{t.habits.chapter}</label>
              <select
                className="select mt-1"
                value={chapter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChapter(e.target.value as HabitChapter)}
              >
                {Object.values(HABIT_CHAPTERS).map((ch) => (
                  <option key={ch} value={ch}>
                    {language === 'en' ? HABIT_CHAPTER_LABELS[ch].en : HABIT_CHAPTER_LABELS[ch].ja}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="label">{t.habits.frequency}</label>
              <select
                className="select mt-1"
                value={frequency}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFrequency(e.target.value as HabitFrequency)}
              >
                {Object.values(HABIT_FREQUENCIES).map((freq) => (
                  <option key={freq} value={freq}>
                    {language === 'en' ? HABIT_FREQUENCY_LABELS[freq].en : HABIT_FREQUENCY_LABELS[freq].ja}
                  </option>
                ))}
              </select>
            </div>

            {/* Principle */}
            <div>
              <label className="label">{t.habits.principle}</label>
              <select
                className="select mt-1"
                value={principle}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPrinciple(e.target.value as HabitPrinciple)}
              >
                {Object.values(HABIT_PRINCIPLES).map((p) => (
                  <option key={p} value={p}>
                    {language === 'en' ? HABIT_PRINCIPLE_LABELS[p].en : HABIT_PRINCIPLE_LABELS[p].ja}
                  </option>
                ))}
              </select>
            </div>

            {/* Trigger */}
            <div>
              <label className="label">{t.habits.trigger}</label>
              <input
                className="input mt-1"
                value={trigger}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTrigger(e.target.value)}
                placeholder={t.habits.triggerPlaceholder}
                maxLength={200}
              />
            </div>

            {/* Evidence */}
            <div>
              <label className="label">{t.habits.evidence}</label>
              <textarea
                className="textarea mt-1"
                value={evidence}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEvidence(e.target.value)}
                placeholder={t.habits.evidencePlaceholder}
                maxLength={500}
                rows={2}
              />
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-2 pt-2"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
                {t.habits.cancel}
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="btn btn-primary text-xs"
              >
                {t.habits.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  )
}
