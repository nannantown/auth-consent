'use client'

import { useI18n } from '@/lib/i18n'
import { HABIT_CHAPTERS, HABIT_CHAPTER_LABELS, HABIT_CHAPTER_COLORS } from '@/types/graph'
import type { HabitChapter } from '@/types/graph'

interface HabitChapterFilterProps {
  selected: HabitChapter | null
  onSelect: (chapter: HabitChapter | null) => void
}

export function HabitChapterFilter({ selected, onSelect }: HabitChapterFilterProps) {
  const { t, language } = useI18n()

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      <button
        onClick={() => onSelect(null)}
        className="pill-filter flex-shrink-0"
        style={
          selected === null
            ? { background: 'var(--selected-bg)', color: 'var(--selected-text)', borderColor: 'var(--selected-bg)' }
            : undefined
        }
      >
        {t.habits.allChapters}
      </button>
      {Object.values(HABIT_CHAPTERS).map((ch) => {
        const isSelected = selected === ch
        const color = HABIT_CHAPTER_COLORS[ch]
        return (
          <button
            key={ch}
            onClick={() => onSelect(isSelected ? null : ch)}
            className="pill-filter flex-shrink-0"
            style={
              isSelected
                ? { background: color, color: '#fff', borderColor: color }
                : undefined
            }
          >
            {language === 'en' ? HABIT_CHAPTER_LABELS[ch].en : HABIT_CHAPTER_LABELS[ch].ja}
          </button>
        )
      })}
    </div>
  )
}
