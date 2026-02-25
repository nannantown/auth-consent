'use client'

import type { Node } from '@/types/graph'
import type { GoalProperties } from '@/types/goals'
import { Badge, DropdownMenu, DropdownItem, DropdownDivider } from '@ground/ui'
import { GoalProgressBar } from './GoalProgressBar'

interface GoalCardProps {
  goal: Node
  language: string
  onEdit: (goal: Node) => void
  onDelete: (goalId: string) => void
}

const STATUS_CONFIG: Record<string, { variant: 'neutral' | 'info' | 'success' | 'error'; label: Record<string, string> }> = {
  not_started: {
    variant: 'neutral',
    label: { en: 'Not Started', ja: '未着手' },
  },
  in_progress: {
    variant: 'info',
    label: { en: 'In Progress', ja: '進行中' },
  },
  completed: {
    variant: 'success',
    label: { en: 'Completed', ja: '完了' },
  },
  abandoned: {
    variant: 'error',
    label: { en: 'Abandoned', ja: '中止' },
  },
}

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  personal: { en: 'Personal', ja: '個人' },
  professional: { en: 'Professional', ja: '仕事' },
  health: { en: 'Health', ja: '健康' },
  financial: { en: 'Financial', ja: '財務' },
  other: { en: 'Other', ja: 'その他' },
}

function getDeadlineInfo(
  deadline: string | undefined,
  language: string
): { text: string; isOverdue: boolean } | null {
  if (!deadline) return null
  const target = new Date(deadline)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      text: language === 'en' ? `${Math.abs(diffDays)}d overdue` : `${Math.abs(diffDays)}日超過`,
      isOverdue: true,
    }
  }
  if (diffDays === 0) {
    return { text: language === 'en' ? 'Due today' : '本日期限', isOverdue: false }
  }
  return {
    text: language === 'en' ? `${diffDays}d remaining` : `残り${diffDays}日`,
    isOverdue: false,
  }
}

export function GoalCard({ goal, language, onEdit, onDelete }: GoalCardProps) {
  const props = goal.properties as GoalProperties
  const status = props.status || 'not_started'
  const progress = props.progress ?? 0
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.not_started
  const categoryLabel = CATEGORY_LABELS[props.category || 'other']?.[language] || props.category || ''
  const deadlineInfo = status !== 'completed' && status !== 'abandoned'
    ? getDeadlineInfo(props.deadline, language)
    : null
  const milestoneDone = (props.milestones || []).filter((m) => m.completed).length
  const milestoneTotal = (props.milestones || []).length

  const menuTrigger = (
    <button
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
      style={{ color: 'var(--text-muted)' }}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
    </button>
  )

  return (
    <div className="card-interactive p-4">
      {/* Top row: title + actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className="font-medium text-sm"
              style={{
                color: 'var(--text-primary)',
                textDecoration: status === 'abandoned' ? 'line-through' : 'none',
                opacity: status === 'abandoned' ? 0.6 : 1,
              }}
            >
              {goal.title}
            </h4>
            <Badge variant={statusConfig.variant}>
              {statusConfig.label[language] || statusConfig.label.en}
            </Badge>
          </div>

          {props.description && (
            <p
              className="text-xs mt-1 line-clamp-2"
              style={{ color: 'var(--text-muted)' }}
            >
              {props.description}
            </p>
          )}
        </div>

        {/* Action menu */}
        <DropdownMenu trigger={menuTrigger} align="right">
          <DropdownItem onClick={() => onEdit(goal)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {language === 'en' ? 'Edit' : '編集'}
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem variant="danger" onClick={() => onDelete(goal.id)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {language === 'en' ? 'Delete' : '削除'}
          </DropdownItem>
        </DropdownMenu>
      </div>

      {/* Progress bar */}
      {status !== 'abandoned' && (
        <div className="mt-3">
          <GoalProgressBar progress={progress} size="sm" />
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {categoryLabel && (
          <Badge variant="neutral">
            {categoryLabel}
          </Badge>
        )}

        {deadlineInfo && (
          <span
            className="text-[10px] flex items-center gap-1"
            style={{ color: deadlineInfo.isOverdue ? 'var(--error)' : 'var(--text-muted)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {deadlineInfo.text}
          </span>
        )}

        {milestoneTotal > 0 && (
          <span
            className="text-[10px] flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {milestoneDone}/{milestoneTotal}
          </span>
        )}
      </div>
    </div>
  )
}
