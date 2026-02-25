'use client'

import type { Node } from '@/types/graph'
import type { GoalProperties } from '@/types/goals'
import { StatCard } from '@ground/ui'

interface GoalStatsProps {
  goals: Node[]
  language: string
}

export function GoalStats({ goals, language }: GoalStatsProps) {
  const total = goals.length
  const completed = goals.filter(
    (g) => (g.properties as GoalProperties).status === 'completed'
  ).length
  const inProgress = goals.filter(
    (g) => (g.properties as GoalProperties).status === 'in_progress'
  ).length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label={language === 'en' ? 'Total' : '合計'}
          value={total}
        />
        <StatCard
          label={language === 'en' ? 'In Progress' : '進行中'}
          value={inProgress}
          icon={<div className="w-2 h-2 rounded-full" style={{ background: 'var(--info)' }} />}
        />
        <StatCard
          label={language === 'en' ? 'Completed' : '完了'}
          value={completed}
          icon={<div className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />}
        />
        <StatCard
          label={language === 'en' ? 'Rate' : '達成率'}
          value={`${completionRate}%`}
          icon={<div className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />}
        />
      </div>

      {total > 0 && (
        <div
          className="card-stat"
        >
          <div className="flex items-center justify-between">
            <p
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--stat-label)' }}
            >
              {language === 'en' ? 'Completion Rate' : '達成率'}
            </p>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: 'var(--text-secondary)' }}
            >
              {completionRate}%
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden mt-2"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionRate}%`,
                background: 'var(--success)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
