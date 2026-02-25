'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
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
import { StatCard, ConfirmDialog, EmptyState } from '@ground/ui'
import { useI18n } from '@/lib/i18n'

// ─── Types ───────────────────────────────────────────────
interface HabitProperties {
  frequency: 'daily' | 'weekly'
  target_count: number
  color: string
  completions: string[]
}

interface HabitTrackerViewProps {
  user: User
  categorySlug: string
  category: Category
  language: string
}

// ─── Constants ───────────────────────────────────────────
const HABIT_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

const HEATMAP_COLORS = [
  'rgba(255, 255, 255, 0.04)',
  'rgba(34, 197, 94, 0.25)',
  'rgba(34, 197, 94, 0.50)',
  'rgba(34, 197, 94, 0.75)',
  '#22c55e',
]

// ─── Helpers ─────────────────────────────────────────────
function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getCompletions(node: Node): string[] {
  const props = node.properties as Partial<HabitProperties>
  return props.completions ?? []
}

function getHabitProps(node: Node): HabitProperties {
  const props = node.properties as Partial<HabitProperties>
  return {
    frequency: props.frequency ?? 'daily',
    target_count: props.target_count ?? 1,
    color: props.color ?? HABIT_COLORS[0],
    completions: props.completions ?? [],
  }
}

/** Calculate current streak: consecutive days ending at today with at least one habit completed */
function calcCurrentStreak(habits: Node[]): number {
  if (habits.length === 0) return 0
  const allCompletions = new Set<string>()
  for (const h of habits) {
    for (const d of getCompletions(h)) allCompletions.add(d)
  }
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (allCompletions.has(toDateStr(d))) {
      streak++
    } else {
      break
    }
  }
  return streak
}

/** Calculate best streak across all habits */
function calcBestStreak(habits: Node[]): number {
  if (habits.length === 0) return 0
  const allCompletions = new Set<string>()
  for (const h of habits) {
    for (const d of getCompletions(h)) allCompletions.add(d)
  }
  const sorted = Array.from(allCompletions).sort()
  if (sorted.length === 0) return 0
  let best = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 1) {
      current++
      if (current > best) best = current
    } else {
      current = 1
    }
  }
  return best
}

/** Completion rate over last 30 days */
function calcCompletionRate(habits: Node[]): number {
  if (habits.length === 0) return 0
  const today = new Date()
  let totalPossible = 0
  let totalCompleted = 0
  for (const h of habits) {
    const props = getHabitProps(h)
    const completions = new Set(props.completions)
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = toDateStr(d)
      if (props.frequency === 'daily') {
        totalPossible++
        if (completions.has(dateStr)) totalCompleted++
      }
    }
    if (props.frequency === 'weekly') {
      // For weekly, 30 days ~ 4.3 weeks
      totalPossible += 4
      const last30 = Array.from(completions).filter((c) => {
        const cd = new Date(c)
        return (today.getTime() - cd.getTime()) / (1000 * 60 * 60 * 24) <= 30
      })
      totalCompleted += Math.min(last30.length, 4)
    }
  }
  return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
}

/** Build heatmap data for last 90 days */
function buildHeatmapData(habits: Node[]): { date: string; count: number }[] {
  const countMap = new Map<string, number>()
  for (const h of habits) {
    for (const d of getCompletions(h)) {
      countMap.set(d, (countMap.get(d) || 0) + 1)
    }
  }
  const today = new Date()
  const data: { date: string; count: number }[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = toDateStr(d)
    data.push({ date: dateStr, count: countMap.get(dateStr) || 0 })
  }
  return data
}

/** Get color index for heatmap: 0=none, 1=1, 2=2, 3=3, 4=4+ */
function getHeatmapLevel(count: number): number {
  if (count === 0) return 0
  if (count >= 4) return 4
  return count
}

/** Calculate streak for a single habit */
function calcHabitStreak(habit: Node): number {
  const completions = new Set(getCompletions(habit))
  if (completions.size === 0) return 0
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (completions.has(toDateStr(d))) {
      streak++
    } else {
      break
    }
  }
  return streak
}

/** Get last 7 days completion for a habit */
function getLast7Days(habit: Node): boolean[] {
  const completions = new Set(getCompletions(habit))
  const result: boolean[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    result.push(completions.has(toDateStr(d)))
  }
  return result
}

// ─── Main Component ──────────────────────────────────────
export function HabitTrackerView({ user, categorySlug, language }: HabitTrackerViewProps) {
  const [graphCategory, setGraphCategory] = useState<GraphCategory | null>(null)
  const [habits, setHabits] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Node | null>(null)
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null)

  const { t: i18n } = useI18n()
  const ht = i18n.goals.habitTracker
  const template = getTemplateBySlug(categorySlug)
  const today = toDateStr(new Date())

  // ─── Data Loading ───
  const loadData = useCallback(async () => {
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
          setHabits(data.nodes.filter((n) => n.node_type === 'Habit'))
        }
      }
    } catch (error) {
      console.error('Failed to load habits:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, categorySlug, template])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ─── CRUD handlers ───
  const handleSave = async (title: string, properties: Record<string, unknown>) => {
    if (editingHabit) {
      await updateNode(editingHabit.id, { title, properties: { ...editingHabit.properties, ...properties } })
    } else {
      await createNode(user.id, {
        category_id: graphCategory!.id,
        node_type: 'Habit',
        title,
        properties,
      })
    }
    setShowForm(false)
    setEditingHabit(null)
    await loadData()
  }

  const handleDelete = async () => {
    if (!deletingHabitId) return
    await deleteNode(deletingHabitId)
    setDeletingHabitId(null)
    await loadData()
  }

  const handleToggleToday = async (habit: Node) => {
    const props = getHabitProps(habit)
    const completions = [...props.completions]
    const idx = completions.indexOf(today)
    if (idx >= 0) {
      completions.splice(idx, 1)
    } else {
      completions.push(today)
    }
    const updated = await updateNode(habit.id, {
      properties: { ...props, completions },
    })
    if (updated) {
      setHabits((prev) => prev.map((h) => (h.id === habit.id ? updated : h)))
    }
  }

  // ─── Computed ───
  const currentStreak = useMemo(() => calcCurrentStreak(habits), [habits])
  const bestStreak = useMemo(() => calcBestStreak(habits), [habits])
  const completionRate = useMemo(() => calcCompletionRate(habits), [habits])
  const heatmapData = useMemo(() => buildHeatmapData(habits), [habits])

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton rounded-xl" style={{ height: '80px' }} />
          ))}
        </div>
        <div className="skeleton rounded-xl" style={{ height: '160px' }} />
        <div className="skeleton rounded-xl" style={{ height: '120px' }} />
      </div>
    )
  }

  // ─── Empty State ───
  if (habits.length === 0 && !showForm) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
          }
          title={ht.emptyTitle}
          description={ht.emptyDescription}
          action={
            <button
              onClick={() => { setEditingHabit(null); setShowForm(true) }}
              className="btn btn-secondary text-sm"
            >
              {ht.emptyAction}
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* A. Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label={ht.currentStreak}
          value={currentStreak}
          icon={<div className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />}
        />
        <StatCard
          label={ht.bestStreak}
          value={bestStreak}
          icon={<div className="w-2 h-2 rounded-full" style={{ background: 'var(--info)' }} />}
        />
        <StatCard
          label={ht.completionRate}
          value={`${completionRate}%`}
          icon={<div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />}
        />
      </div>

      {/* B. Heatmap Calendar */}
      <HeatmapCalendar data={heatmapData} language={language} lessLabel={ht.less} moreLabel={ht.more} />

      {/* C. Today's Check-in */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-translucent)',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#22c55e' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {ht.todayHabits}
            </h3>
          </div>
          <button
            onClick={() => { setEditingHabit(null); setShowForm(true) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
            style={{ color: '#22c55e' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {ht.addHabit}
          </button>
        </div>

        <div className="p-4 space-y-2">
          {habits.map((habit) => {
            const props = getHabitProps(habit)
            const isComplete = props.completions.includes(today)
            return (
              <button
                key={habit.id}
                onClick={() => handleToggleToday(habit)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: isComplete ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-surface)',
                  border: `1px solid ${isComplete ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-subtle)'}`,
                }}
              >
                {/* Color dot */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: props.color }}
                />
                {/* Title */}
                <span
                  className="flex-1 text-left text-sm font-medium"
                  style={{
                    color: isComplete ? 'var(--success)' : 'var(--text-primary)',
                  }}
                >
                  {habit.title}
                </span>
                {/* Check circle */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    background: isComplete ? '#22c55e' : 'transparent',
                    border: isComplete ? 'none' : '1.5px solid var(--border-default)',
                    animation: isComplete ? 'check-bounce 0.3s ease-out' : 'none',
                  }}
                >
                  {isComplete && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* D. All Habits Card List */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-translucent)',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {ht.allHabits}
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: 'var(--bg-surface-hover)',
              color: 'var(--text-muted)',
            }}
          >
            {habits.length}
          </span>
        </div>

        <div className="p-4 space-y-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={() => { setEditingHabit(habit); setShowForm(true) }}
              onDelete={() => setDeletingHabitId(habit.id)}
              labels={ht}
            />
          ))}
        </div>
      </div>

      {/* E. Habit Form Modal */}
      {showForm && (
        <HabitFormModal
          habit={editingHabit}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingHabit(null) }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingHabitId}
        onClose={() => setDeletingHabitId(null)}
        onConfirm={handleDelete}
        title={ht.deleteHabit}
        message={ht.deleteConfirm}
        confirmLabel={ht.delete}
        cancelLabel={ht.cancel}
        variant="danger"
      />
    </div>
  )
}

// ─── Heatmap Calendar ────────────────────────────────────
function HeatmapCalendar({
  data,
  language,
  lessLabel,
  moreLabel,
}: {
  data: { date: string; count: number }[]
  language: string
  lessLabel: string
  moreLabel: string
}) {
  // Build weeks grid (columns = weeks, rows = days of week 0-6)
  // The data is 90 days. We group them into weeks.
  const weeks: { date: string; count: number; dow: number }[][] = []
  let currentWeek: { date: string; count: number; dow: number }[] = []

  for (const item of data) {
    const d = new Date(item.date)
    const dow = d.getDay() // 0=Sun, 6=Sat
    if (dow === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push({ ...item, dow })
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = -1
  const monthNames = language === 'en'
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  for (let i = 0; i < weeks.length; i++) {
    const firstDay = new Date(weeks[i][0].date)
    const month = firstDay.getMonth()
    if (month !== lastMonth) {
      monthLabels.push({ label: monthNames[month], col: i })
      lastMonth = month
    }
  }

  // Day labels
  const dayLabels = language === 'en'
    ? [
        { label: 'Mon', row: 1 },
        { label: 'Wed', row: 3 },
        { label: 'Fri', row: 5 },
      ]
    : [
        { label: '月', row: 1 },
        { label: '水', row: 3 },
        { label: '金', row: 5 },
      ]

  return (
    <div
      className="card p-5"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Month labels */}
      <div className="flex mb-2" style={{ paddingLeft: '28px' }}>
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="text-[10px]"
            style={{
              color: 'var(--text-muted)',
              position: 'relative',
              left: `${m.col * 13}px`,
              marginRight: i < monthLabels.length - 1 ? `${((monthLabels[i + 1]?.col ?? m.col) - m.col) * 13 - 20}px` : '0',
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-0">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-2 flex-shrink-0" style={{ width: '20px' }}>
          {[0, 1, 2, 3, 4, 5, 6].map((row) => {
            const dayLabel = dayLabels.find((d) => d.row === row)
            return (
              <div
                key={row}
                className="flex items-center justify-end"
                style={{ height: '10px' }}
              >
                {dayLabel && (
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    {dayLabel.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Cells */}
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {/* Fill empty slots at beginning of first week */}
              {wi === 0 &&
                Array.from({ length: week[0].dow }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ width: 10, height: 10 }} />
                ))}
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count}`}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: HEATMAP_COLORS[getHeatmapLevel(day.count)],
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {lessLabel}
        </span>
        {HEATMAP_COLORS.map((color, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: color,
            }}
          />
        ))}
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {moreLabel}
        </span>
      </div>
    </div>
  )
}

// ─── Habit Card ──────────────────────────────────────────
function HabitCard({
  habit,
  onEdit,
  onDelete,
  labels,
}: {
  habit: Node
  onEdit: () => void
  onDelete: () => void
  labels: { daily: string; weekly: string; editHabit: string; deleteHabit: string }
}) {
  const [showMenu, setShowMenu] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const props = getHabitProps(habit)
  const streak = calcHabitStreak(habit)
  const last7 = getLast7Days(habit)

  const openMenu = () => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setShowMenu(true)
  }

  return (
    <div
      className="rounded-xl p-4 transition-colors"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: color dot + name + badge */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: props.color }}
          />
          <span
            className="font-medium text-sm truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {habit.title}
          </span>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
            style={{
              background: `${props.color}20`,
              color: props.color,
            }}
          >
            {props.frequency === 'daily' ? labels.daily : labels.weekly}
          </span>
        </div>

        {/* Middle: streak */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
          <span
            className="text-xs font-medium tabular-nums"
            style={{ color: 'var(--text-secondary)' }}
          >
            {streak}
          </span>
        </div>

        {/* Right: mini bars (last 7 days) */}
        <div className="flex items-end gap-0.5 flex-shrink-0" style={{ height: 16 }}>
          {last7.map((completed, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: completed ? 16 : 6,
                borderRadius: 1,
                background: completed ? props.color : 'var(--border-default)',
                transition: 'height 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* 3-dot menu */}
        <div className="flex-shrink-0">
          <button
            ref={menuButtonRef}
            onClick={openMenu}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {showMenu && createPortal(
            <>
              <div
                className="fixed inset-0"
                style={{ zIndex: 9998 }}
                onClick={() => setShowMenu(false)}
              />
              <div
                className="fixed rounded-xl py-1 min-w-[120px]"
                style={{
                  top: menuPos.top,
                  right: menuPos.right,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  zIndex: 9999,
                }}
              >
                <button
                  onClick={() => { setShowMenu(false); onEdit() }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {labels.editHabit}
                </button>
                <button
                  onClick={() => { setShowMenu(false); onDelete() }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'var(--error)' }}
                >
                  {labels.deleteHabit}
                </button>
              </div>
            </>,
            document.body,
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Habit Form Modal ────────────────────────────────────
function HabitFormModal({
  habit,
  onSave,
  onClose,
}: {
  habit: Node | null
  onSave: (title: string, properties: Record<string, unknown>) => Promise<void>
  onClose: () => void
}) {
  const existingProps = habit ? getHabitProps(habit) : null
  const [title, setTitle] = useState(habit?.title || '')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(existingProps?.frequency ?? 'daily')
  const [targetCount, setTargetCount] = useState(existingProps?.target_count ?? 1)
  const [color, setColor] = useState(existingProps?.color ?? HABIT_COLORS[0])
  const [saving, setSaving] = useState(false)

  const isEdit = !!habit
  const { t: i18n } = useI18n()
  const ft = i18n.goals.habitTracker

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const properties: HabitProperties = {
        frequency,
        target_count: targetCount,
        color,
        completions: existingProps?.completions ?? [],
      }
      await onSave(title.trim(), properties)
    } finally {
      setSaving(false)
    }
  }

  const modal = (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative rounded-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isEdit ? ft.editHabit : ft.addHabit}
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Habit Name */}
          <div>
            <label className="label mb-2">{ft.habitName} *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder={ft.habitNamePlaceholder}
              required
              autoFocus
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="label mb-2">{ft.frequency}</label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={frequency === f ? 'pill-filter-active' : 'pill-filter'}
                >
                  {f === 'daily' ? ft.daily : ft.weekly}
                </button>
              ))}
            </div>
          </div>

          {/* Target Count */}
          <div>
            <label className="label mb-2">
              {ft.targetCount}{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                {frequency === 'daily' ? ft.perDay : ft.perWeek}
              </span>
            </label>
            <input
              type="number"
              min={1}
              max={99}
              value={targetCount}
              onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="input"
              style={{ width: '100px' }}
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="label mb-2">{ft.color}</label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform"
                  style={{
                    background: c,
                    transform: color === c ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: color === c ? `0 0 0 2px var(--bg-elevated), 0 0 0 4px ${c}` : 'none',
                  }}
                >
                  {color === c && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              {ft.cancel}
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="btn btn-primary flex-1"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                ft.save
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
