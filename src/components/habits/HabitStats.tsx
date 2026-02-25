'use client'

import { useI18n } from '@/lib/i18n'
import type { Node } from '@/types/graph'

interface HabitStatsProps {
  habits: Node[]
  completedTodayCount: number
}

export function HabitStats({ habits, completedTodayCount }: HabitStatsProps) {
  const { t } = useI18n()

  const activeCount = habits.filter(
    (h) => (h.properties as Record<string, unknown>).is_active !== false
  ).length

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="card-stat px-3 py-2.5 text-center">
        <div
          className="text-xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {habits.length}
        </div>
        <div
          className="text-[10px] uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {t.habits.totalHabits}
        </div>
      </div>
      <div className="card-stat px-3 py-2.5 text-center">
        <div
          className="text-xl font-semibold"
          style={{ color: 'var(--success)' }}
        >
          {completedTodayCount}
        </div>
        <div
          className="text-[10px] uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {t.habits.completedToday}
        </div>
      </div>
      <div className="card-stat px-3 py-2.5 text-center">
        <div
          className="text-xl font-semibold"
          style={{ color: 'var(--accent)' }}
        >
          {activeCount}
        </div>
        <div
          className="text-[10px] uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {t.habits.activeHabits}
        </div>
      </div>
    </div>
  )
}
