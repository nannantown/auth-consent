'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Category } from '@/types/category'
import type { Node, Category as GraphCategory } from '@/types/graph'
import {
  getCategoryBySlug as getGraphCategoryBySlug,
  createCategory as createGraphCategory,
  getCategoryWithNodes,
  createNode,
  updateNode,
  deleteNode,
} from '@/lib/graph'
import { getTemplateBySlug } from '@/types/graph'
import type { GoalProperties, GoalStatus } from '@/types/goals'
import { EmptyState, ConfirmDialog } from '@ground/ui'
import { GoalStats } from './GoalStats'
import { GoalCard } from './GoalCard'
import { GoalForm } from './GoalForm'

type FilterStatus = 'all' | GoalStatus

interface GoalsViewProps {
  user: User
  categorySlug: string
  category: Category
  language: string
}

const FILTER_OPTIONS: Array<{ value: FilterStatus; label: Record<string, string> }> = [
  { value: 'all', label: { en: 'All', ja: 'すべて' } },
  { value: 'in_progress', label: { en: 'In Progress', ja: '進行中' } },
  { value: 'completed', label: { en: 'Completed', ja: '完了' } },
  { value: 'not_started', label: { en: 'Not Started', ja: '未着手' } },
  { value: 'abandoned', label: { en: 'Abandoned', ja: '中止' } },
]

export function GoalsView({ user, categorySlug, category, language }: GoalsViewProps) {
  const [graphCategory, setGraphCategory] = useState<GraphCategory | null>(null)
  const [goals, setGoals] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Node | null>(null)
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null)

  const template = getTemplateBySlug(categorySlug)

  const loadGoals = useCallback(async () => {
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
        const data = await getCategoryWithNodes(cat.id)
        if (data) {
          setGoals(data.nodes.filter((n) => n.node_type === 'Goal'))
        }
      }
    } catch (error) {
      console.error('Failed to load goals:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, categorySlug, template])

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

  const handleSave = async (title: string, properties: Record<string, unknown>) => {
    if (editingGoal) {
      await updateNode(editingGoal.id, { title, properties })
    } else {
      await createNode(user.id, {
        category_id: graphCategory!.id,
        node_type: 'Goal',
        title,
        properties,
      })
    }
    setShowForm(false)
    setEditingGoal(null)
    await loadGoals()
  }

  const handleDelete = async () => {
    if (!deletingGoalId) return
    await deleteNode(deletingGoalId)
    setDeletingGoalId(null)
    await loadGoals()
  }

  const handleEdit = (goal: Node) => {
    setEditingGoal(goal)
    setShowForm(true)
  }

  const filteredGoals = goals.filter((goal) => {
    if (filter === 'all') return true
    const status = (goal.properties as GoalProperties).status || 'not_started'
    return status === filter
  })

  // Sort: in_progress first, then not_started, completed, abandoned. Within group, sort by deadline
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      in_progress: 0,
      not_started: 1,
      completed: 2,
      abandoned: 3,
    }
    const aStatus = (a.properties as GoalProperties).status || 'not_started'
    const bStatus = (b.properties as GoalProperties).status || 'not_started'
    const orderDiff = (statusOrder[aStatus] ?? 4) - (statusOrder[bStatus] ?? 4)
    if (orderDiff !== 0) return orderDiff

    const aDeadline = (a.properties as GoalProperties).deadline || ''
    const bDeadline = (b.properties as GoalProperties).deadline || ''
    if (aDeadline && bDeadline) return aDeadline.localeCompare(bDeadline)
    if (aDeadline) return -1
    if (bDeadline) return 1
    return 0
  })

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="skeleton rounded-xl"
              style={{ height: '80px' }}
            />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="skeleton rounded-xl"
              style={{ height: '100px' }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <GoalStats goals={goals} language={language} />

      {/* Toolbar: Filter pills + Add button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_OPTIONS.map((option) => {
            const isActive = filter === option.value
            const count = option.value === 'all'
              ? goals.length
              : goals.filter(
                  (g) => ((g.properties as GoalProperties).status || 'not_started') === option.value
                ).length
            return (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={isActive ? 'pill-filter-active' : 'pill-filter'}
              >
                {option.label[language] || option.label.en}
                <span
                  className="ml-1 text-[10px]"
                  style={{ opacity: isActive ? 0.7 : 0.5 }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => {
            setEditingGoal(null)
            setShowForm(true)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'en' ? 'Add Goal' : '目標を追加'}
        </button>
      </div>

      {/* Goals list */}
      {sortedGoals.length === 0 ? (
        <EmptyState
          icon={
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          title={
            filter !== 'all'
              ? (language === 'en' ? 'No goals with this status' : 'このステータスの目標はありません')
              : (language === 'en' ? 'No goals yet' : '目標がまだありません')
          }
          action={
            filter === 'all' ? (
              <button
                onClick={() => {
                  setEditingGoal(null)
                  setShowForm(true)
                }}
                className="btn btn-secondary text-sm"
              >
                {language === 'en' ? 'Create your first goal' : '最初の目標を作成'}
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {sortedGoals.map((goal, index) => (
            <div
              key={goal.id}
              className={`animate-fade-in stagger-${Math.min(index + 1, 6)}`}
            >
              <GoalCard
                goal={goal}
                language={language}
                onEdit={handleEdit}
                onDelete={(goalId) => setDeletingGoalId(goalId)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <GoalForm
          goal={editingGoal}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingGoal(null)
          }}
          language={language}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deletingGoalId}
        onClose={() => setDeletingGoalId(null)}
        onConfirm={handleDelete}
        title={language === 'en' ? 'Delete Goal' : '目標を削除'}
        message={language === 'en'
          ? 'Are you sure you want to delete this goal? This action cannot be undone.'
          : 'この目標を削除しますか？この操作は取り消せません。'}
        confirmLabel={language === 'en' ? 'Delete' : '削除'}
        cancelLabel={language === 'en' ? 'Cancel' : 'キャンセル'}
        variant="danger"
      />
    </div>
  )
}
