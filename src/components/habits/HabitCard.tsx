'use client'

import { useI18n } from '@/lib/i18n'
import {
  HABIT_CHAPTER_LABELS,
  HABIT_CHAPTER_COLORS,
  HABIT_FREQUENCY_LABELS,
  HABIT_PRINCIPLE_LABELS,
} from '@/types/graph'
import type { Node, HabitProperties } from '@/types/graph'

interface HabitCardProps {
  node: Node
  isCompletedToday: boolean
  onCheckIn: (node: Node) => void
  onUndo: (node: Node) => void
  onEdit: (node: Node) => void
  onDelete: (node: Node) => void
}

export function HabitCard({
  node,
  isCompletedToday,
  onCheckIn,
  onUndo,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const { t, language } = useI18n()

  const props = node.properties as HabitProperties

  const chapter = props.chapter
  const chapterLabel = chapter
    ? (language === 'en' ? HABIT_CHAPTER_LABELS[chapter]?.en : HABIT_CHAPTER_LABELS[chapter]?.ja)
    : null
  const chapterColor = chapter ? HABIT_CHAPTER_COLORS[chapter] : 'var(--text-muted)'
  const frequency = props.frequency
  const frequencyLabel = frequency
    ? (language === 'en' ? HABIT_FREQUENCY_LABELS[frequency]?.en : HABIT_FREQUENCY_LABELS[frequency]?.ja)
    : null
  const principle = props.principle
  const principleLabel = principle
    ? (language === 'en' ? HABIT_PRINCIPLE_LABELS[principle]?.en : HABIT_PRINCIPLE_LABELS[principle]?.ja)
    : null
  const streak = props.streak ?? 0
  const bestStreak = props.best_streak ?? 0
  const isActive = props.is_active !== false

  return (
    <div
      className="card-interactive px-4 py-3"
      style={{ opacity: isActive ? 1 : 0.5 }}
    >
      <div className="flex items-center gap-3">
        {/* Check-in button (5-state: default, hover, active, disabled, focus) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            isCompletedToday ? onUndo(node) : onCheckIn(node)
          }}
          disabled={!isActive}
          className={[
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            'transition-all duration-200',
            'focus-visible:outline-2 focus-visible:outline-offset-2',
            isCompletedToday
              ? 'hover:brightness-110 active:brightness-90'
              : 'hover:bg-[rgba(255,255,255,0.05)] hover:border-[var(--border-strong)] active:bg-[rgba(255,255,255,0.08)]',
            !isActive ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
          ].join(' ')}
          style={{
            background: isCompletedToday ? 'var(--success)' : 'transparent',
            border: isCompletedToday ? 'none' : '2px solid var(--border-default)',
            color: isCompletedToday ? '#fff' : 'var(--text-muted)',
            outlineColor: 'var(--focus-ring)',
          }}
          title={isCompletedToday ? t.habits.undo : t.habits.checkIn}
        >
          {isCompletedToday ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : null}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium truncate"
              style={{
                color: 'var(--text-primary)',
                textDecoration: isCompletedToday ? 'line-through' : 'none',
                opacity: isCompletedToday ? 0.6 : 1,
              }}
            >
              {node.title}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {chapterLabel && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: `${chapterColor}20`,
                  color: chapterColor,
                }}
              >
                {chapterLabel}
              </span>
            )}
            {frequencyLabel && (
              <span
                className="text-[10px]"
                style={{ color: 'var(--text-muted)' }}
              >
                {frequencyLabel}
              </span>
            )}
            {principleLabel && (
              <span
                className="text-[10px]"
                style={{ color: 'var(--text-muted)' }}
              >
                {principleLabel}
              </span>
            )}
          </div>
        </div>

        {/* Streak */}
        <div className="flex-shrink-0 text-right">
          {streak > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--warning)' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {streak}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {t.habits.days}
              </span>
            </div>
          )}
          {bestStreak > 0 && (
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {t.habits.bestStreak} {bestStreak}{t.habits.days}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(node)
            }}
            className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(node)
            }}
            className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ color: 'var(--error)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
