'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  getCategoryBySlug as getGraphCategoryBySlug,
  createCategory as createGraphCategory,
  getCategoryWithNodes,
  createNode,
  updateNode,
  deleteNode,
} from '@/lib/graph'
import { getTemplateBySlug } from '@/types/graph'
import type { Node, Category as GraphCategory } from '@/types/graph'
import type { Category } from '@/types/category'
import { StatCard, ConfirmDialog, EmptyState, Modal, ModalHeader, ModalBody, ModalFooter } from '@ground/ui'
import { useI18n } from '@/lib/i18n'

// ─── Types ───────────────────────────────────────────────
interface HealthViewProps {
  user: User
  categorySlug: string
  category: Category
  language: string
}

type HealthRecordProps = {
  metric_type?: string
  value?: string
  unit?: string
  date?: string
  notes?: string
}

type PeriodKey = '7d' | '30d' | '90d' | 'all'

// ─── Constants ───────────────────────────────────────────
const METRIC_TYPES = ['Weight', 'Blood Pressure', 'Heart Rate', 'Sleep', 'Steps', 'Body Fat', 'Other'] as const

const METRIC_COLORS: Record<string, string> = {
  Weight: '#3b82f6',
  'Blood Pressure': '#ef4444',
  'Heart Rate': '#ec4899',
  Sleep: '#8b5cf6',
  Steps: '#22c55e',
  'Body Fat': '#f59e0b',
  Other: '#6b7280',
}

const DEFAULT_UNITS: Record<string, string> = {
  Weight: 'kg',
  'Blood Pressure': 'mmHg',
  'Heart Rate': 'bpm',
  Sleep: 'hrs',
  Steps: '',
  'Body Fat': '%',
}

// For metrics where "up" is bad (like weight, body fat, blood pressure)
const HIGHER_IS_WORSE = new Set(['Weight', 'Blood Pressure', 'Body Fat'])

const PERIOD_DAYS: Record<PeriodKey, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
}

// ─── Helpers ─────────────────────────────────────────────
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getRecordDate(node: Node): string {
  const props = node.properties as HealthRecordProps
  return props.date || node.created_at.split('T')[0]
}

function getNumericValue(node: Node): number | null {
  const props = node.properties as HealthRecordProps
  const v = parseFloat(props.value || '')
  return isNaN(v) ? null : v
}

function filterByPeriod(nodes: Node[], periodDays: number | null): Node[] {
  if (periodDays === null) return nodes
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - periodDays)
  const cutoffStr = toLocalDateStr(cutoff)
  return nodes.filter((n) => {
    const d = getRecordDate(n)
    return d >= cutoffStr
  })
}

function formatDateShort(dateStr: string, lang: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  if (lang === 'ja') {
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

// ─── Main Component ──────────────────────────────────────
export function HealthView({ user, categorySlug }: HealthViewProps) {
  const [graphCategory, setGraphCategory] = useState<GraphCategory | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null)
  const [period, setPeriod] = useState<PeriodKey>('30d')
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  const trendRef = useRef<HTMLDivElement>(null)
  const { t: i18n, language } = useI18n()
  const ht = i18n.health
  const template = getTemplateBySlug(categorySlug)

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
        const result = await getCategoryWithNodes(cat.id)
        if (result) setNodes(result.nodes)
      }
    } catch (error) {
      console.error('Failed to load health data:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, categorySlug, template])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ─── CRUD ───
  const handleSave = async (title: string, props: HealthRecordProps) => {
    if (!graphCategory) return
    if (editingNode) {
      await updateNode(editingNode.id, {
        title,
        properties: { ...(editingNode.properties as Record<string, unknown>), ...props },
      })
    } else {
      await createNode(user.id, {
        category_id: graphCategory.id,
        node_type: 'HealthRecord',
        title,
        properties: props,
      })
    }
    setShowForm(false)
    setEditingNode(null)
    await loadData()
  }

  const handleDelete = async () => {
    if (!deletingNodeId) return
    await deleteNode(deletingNodeId)
    setDeletingNodeId(null)
    await loadData()
  }

  // ─── Computed ───
  const sortedNodes = useMemo(
    () =>
      [...nodes].sort((a, b) => {
        const dateA = getRecordDate(a)
        const dateB = getRecordDate(b)
        return dateB.localeCompare(dateA)
      }),
    [nodes],
  )

  const periodDays = PERIOD_DAYS[period]

  const filteredNodes = useMemo(() => filterByPeriod(sortedNodes, periodDays), [sortedNodes, periodDays])

  // Metric cards data: latest value per metric, sparkline data, delta
  const metricCardsData = useMemo(() => {
    const result: {
      metricType: string
      latestNode: Node
      latestValue: string
      unit: string
      sparkline: number[]
      delta: number | null
      deltaDirection: 'up' | 'down' | 'neutral'
    }[] = []

    for (const metricType of METRIC_TYPES) {
      const metricNodes = filteredNodes.filter(
        (n) => (n.properties as HealthRecordProps).metric_type === metricType,
      )
      if (metricNodes.length === 0) continue

      // Already sorted newest first
      const latestNode = metricNodes[0]
      const latestProps = latestNode.properties as HealthRecordProps
      const latestVal = latestProps.value || '-'
      const unit = latestProps.unit || DEFAULT_UNITS[metricType] || ''

      // Sparkline: last 7 data points (oldest to newest)
      const sparklineNodes = metricNodes.slice(0, 7).reverse()
      const sparkline = sparklineNodes
        .map((n) => getNumericValue(n))
        .filter((v): v is number => v !== null)

      // Delta: compare latest with previous
      let delta: number | null = null
      let deltaDirection: 'up' | 'down' | 'neutral' = 'neutral'
      if (metricNodes.length >= 2) {
        const current = getNumericValue(metricNodes[0])
        const previous = getNumericValue(metricNodes[1])
        if (current !== null && previous !== null) {
          delta = +(current - previous).toFixed(1)
          if (delta > 0) deltaDirection = 'up'
          else if (delta < 0) deltaDirection = 'down'
        }
      }

      result.push({
        metricType,
        latestNode,
        latestValue: latestVal,
        unit,
        sparkline,
        delta,
        deltaDirection,
      })
    }

    return result
  }, [filteredNodes])

  // Trend chart data
  const trendData = useMemo(() => {
    if (!selectedMetric) return []
    return filteredNodes
      .filter((n) => (n.properties as HealthRecordProps).metric_type === selectedMetric)
      .map((n) => {
        const props = n.properties as HealthRecordProps
        const val = parseFloat(props.value || '')
        return {
          date: props.date || n.created_at.split('T')[0],
          value: isNaN(val) ? 0 : val,
        }
      })
      .reverse() // oldest to newest for chart
  }, [filteredNodes, selectedMetric])

  // Stats for selected metric
  const selectedStats = useMemo(() => {
    if (!selectedMetric || trendData.length === 0) return null
    const values = trendData.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
    const unit =
      filteredNodes.find((n) => (n.properties as HealthRecordProps).metric_type === selectedMetric)
        ?.properties as HealthRecordProps | undefined
    return { min, max, avg, unit: unit?.unit || DEFAULT_UNITS[selectedMetric] || '' }
  }, [selectedMetric, trendData, filteredNodes])

  // Records list: filtered by period + selectedMetric
  const recordsList = useMemo(() => {
    if (selectedMetric) {
      return filteredNodes.filter(
        (n) => (n.properties as HealthRecordProps).metric_type === selectedMetric,
      )
    }
    return filteredNodes
  }, [filteredNodes, selectedMetric])

  // When clicking a metric card, scroll to trend
  const handleMetricClick = (metricType: string) => {
    setSelectedMetric((prev) => (prev === metricType ? null : metricType))
    setTimeout(() => {
      trendRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  // ─── Period labels ───
  const periodLabels: Record<PeriodKey, string> = {
    '7d': ht.period7d,
    '30d': ht.period30d,
    '90d': ht.period90d,
    all: ht.periodAll,
  }

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton rounded-full" style={{ width: 48, height: 28 }} />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton rounded-xl" style={{ height: 90 }} />
          ))}
        </div>
        <div className="skeleton rounded-xl" style={{ height: 200 }} />
      </div>
    )
  }

  // ─── Empty State ───
  if (nodes.length === 0 && !showForm) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          }
          title={ht.emptyTitle}
          description={ht.emptyDescription}
          action={
            <button
              onClick={() => {
                setEditingNode(null)
                setShowForm(true)
              }}
              className="btn btn-secondary text-sm"
            >
              {ht.addRecord}
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Period Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {(['7d', '30d', '90d', 'all'] as PeriodKey[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={period === p ? 'pill-filter-active' : 'pill-filter'}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* 2. Metric Cards Grid */}
      {metricCardsData.length > 0 && (
        <div>
          <h3
            className="text-xs font-medium uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {ht.latestMetrics}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {metricCardsData.map(({ metricType, latestValue, unit, sparkline, delta, deltaDirection }) => {
              const color = METRIC_COLORS[metricType] || '#6b7280'
              const metricLabel =
                (ht.metrics as Record<string, string>)[metricType] || metricType
              const isSelected = selectedMetric === metricType

              // Delta color: for "higher is worse" metrics, up is red; otherwise up is green
              const higherIsWorse = HIGHER_IS_WORSE.has(metricType)
              let deltaColor = 'var(--text-muted)'
              if (delta !== null && delta !== 0) {
                if (deltaDirection === 'up') {
                  deltaColor = higherIsWorse ? 'var(--error)' : 'var(--success)'
                } else {
                  deltaColor = higherIsWorse ? 'var(--success)' : 'var(--error)'
                }
              }

              return (
                <button
                  key={metricType}
                  onClick={() => handleMetricClick(metricType)}
                  className="rounded-xl p-4 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                  style={{
                    background: isSelected ? `${color}15` : 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? `${color}40` : 'var(--border-subtle)'}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>
                      {metricLabel}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                          {latestValue}
                        </span>
                        {unit && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {unit}
                          </span>
                        )}
                      </div>
                      {delta !== null && (
                        <span className="text-[10px] font-medium" style={{ color: deltaColor }}>
                          {delta > 0 ? '+' : ''}
                          {delta}
                        </span>
                      )}
                    </div>
                    {sparkline.length >= 2 && <Sparkline data={sparkline} color={color} />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. Trend Chart */}
      {selectedMetric && trendData.length > 0 && (
        <div ref={trendRef}>
          <TrendChart
            data={trendData}
            metricType={selectedMetric}
            color={METRIC_COLORS[selectedMetric] || '#6b7280'}
            label={(ht.metrics as Record<string, string>)[selectedMetric] || selectedMetric}
            chartTitle={ht.trendChart}
            language={language}
            onClose={() => setSelectedMetric(null)}
          />
        </div>
      )}

      {/* 4. Stats Summary */}
      {selectedMetric && selectedStats && (
        <div>
          <h3
            className="text-xs font-medium uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {ht.stats}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label={ht.min} value={`${selectedStats.min} ${selectedStats.unit}`} />
            <StatCard label={ht.max} value={`${selectedStats.max} ${selectedStats.unit}`} />
            <StatCard label={ht.avg} value={`${selectedStats.avg} ${selectedStats.unit}`} />
          </div>
        </div>
      )}

      {/* 5. Records List */}
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
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {ht.records}
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--bg-surface-hover)',
                color: 'var(--text-muted)',
              }}
            >
              {recordsList.length}
            </span>
          </div>
          <button
            onClick={() => {
              setEditingNode(null)
              setShowForm(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {ht.addRecord}
          </button>
        </div>

        {recordsList.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {ht.noData}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {recordsList.map((node) => {
              const props = node.properties as HealthRecordProps
              const metricType = props.metric_type || 'Other'
              const color = METRIC_COLORS[metricType] || '#6b7280'
              const metricLabel = (ht.metrics as Record<string, string>)[metricType] || metricType
              const unit = props.unit || DEFAULT_UNITS[metricType] || ''

              return (
                <div
                  key={node.id}
                  className="flex items-center justify-between gap-3 rounded-xl p-4 transition-colors hover:bg-white/[0.02]"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {props.date && (
                      <span
                        className="text-xs flex-shrink-0 tabular-nums"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {props.date}
                      </span>
                    )}
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                      style={{ background: `${color}20`, color }}
                    >
                      {metricLabel}
                    </span>
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {props.value || '-'} {unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingNode(node)
                        setShowForm(true)
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingNodeId(node.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 6. Form Modal */}
      {showForm && (
        <HealthFormModal
          node={editingNode}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditingNode(null)
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingNodeId}
        onClose={() => setDeletingNodeId(null)}
        onConfirm={handleDelete}
        title={ht.deleteRecord}
        message={ht.deleteConfirm}
        confirmLabel={ht.delete}
        cancelLabel={ht.cancel}
        variant="danger"
      />
    </div>
  )
}

// ─── Sparkline ──────────────────────────────────────────
function Sparkline({
  data,
  color,
  width = 80,
  height = 24,
}: {
  data: number[]
  color: string
  width?: number
  height?: number
}) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 2) - 1
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Trend Chart ────────────────────────────────────────
function TrendChart({
  data,
  color,
  label,
  chartTitle,
  language,
  onClose,
}: {
  data: { date: string; value: number }[]
  metricType: string
  color: string
  label: string
  chartTitle: string
  language: string
  onClose: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (data.length === 0) return null

  const chartHeight = 200
  const padding = { top: 20, right: 16, bottom: 30, left: 48 }
  const w = containerWidth - padding.left - padding.right
  const h = chartHeight - padding.top - padding.bottom

  const values = data.map((d) => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const valRange = maxVal - minVal || 1

  // Build polyline points
  const points =
    w > 0
      ? data
          .map((d, i) => {
            const x = padding.left + (data.length === 1 ? w / 2 : (i / (data.length - 1)) * w)
            const y = padding.top + h - ((d.value - minVal) / valRange) * h
            return `${x},${y}`
          })
          .join(' ')
      : ''

  // Area fill path
  const areaPath =
    w > 0
      ? data
          .map((d, i) => {
            const x = padding.left + (data.length === 1 ? w / 2 : (i / (data.length - 1)) * w)
            const y = padding.top + h - ((d.value - minVal) / valRange) * h
            return `${i === 0 ? 'M' : 'L'}${x},${y}`
          })
          .join(' ') +
        ` L${padding.left + (data.length === 1 ? w / 2 : w)},${padding.top + h} L${padding.left + (data.length === 1 ? w / 2 : 0)},${padding.top + h} Z`
      : ''

  // X-axis labels (5-7 evenly spaced)
  const xLabelCount = Math.min(data.length, 6)
  const xLabels =
    w > 0
      ? Array.from({ length: xLabelCount }, (_, i) => {
          const idx = data.length === 1 ? 0 : Math.round((i / (xLabelCount - 1)) * (data.length - 1))
          const x = padding.left + (data.length === 1 ? w / 2 : (idx / (data.length - 1)) * w)
          return { x, label: formatDateShort(data[idx].date, language) }
        })
      : []

  // Y-axis labels (4 evenly spaced)
  const yLabelCount = 4
  const yLabels =
    h > 0
      ? Array.from({ length: yLabelCount }, (_, i) => {
          const val = minVal + (i / (yLabelCount - 1)) * valRange
          const y = padding.top + h - (i / (yLabelCount - 1)) * h
          return { y, label: val.toFixed(valRange < 10 ? 1 : 0) }
        })
      : []

  return (
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
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {label} - {chartTitle}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div ref={containerRef} className="p-4">
        {containerWidth > 0 && (
          <svg width={containerWidth} height={chartHeight} className="overflow-visible">
            {/* Area fill */}
            <path d={areaPath} fill={color} opacity={0.1} />

            {/* Grid lines */}
            {yLabels.map((yl, i) => (
              <line
                key={i}
                x1={padding.left}
                y1={yl.y}
                x2={padding.left + w}
                y2={yl.y}
                stroke="var(--border-subtle)"
                strokeWidth={0.5}
              />
            ))}

            {/* Polyline */}
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.map((d, i) => {
              const x = padding.left + (data.length === 1 ? w / 2 : (i / (data.length - 1)) * w)
              const y = padding.top + h - ((d.value - minVal) / valRange) * h
              return <circle key={i} cx={x} cy={y} r={3} fill={color} />
            })}

            {/* Y-axis labels */}
            {yLabels.map((yl, i) => (
              <text
                key={i}
                x={padding.left - 8}
                y={yl.y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="var(--text-muted)"
                fontSize={10}
              >
                {yl.label}
              </text>
            ))}

            {/* X-axis labels */}
            {xLabels.map((xl, i) => (
              <text
                key={i}
                x={xl.x}
                y={padding.top + h + 20}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize={10}
              >
                {xl.label}
              </text>
            ))}
          </svg>
        )}
      </div>
    </div>
  )
}

// ─── Health Form Modal ──────────────────────────────────
function HealthFormModal({
  node,
  onSave,
  onClose,
}: {
  node: Node | null
  onSave: (title: string, props: HealthRecordProps) => Promise<void>
  onClose: () => void
}) {
  const existingProps = (node?.properties || {}) as HealthRecordProps
  const { t: i18n, language } = useI18n()
  const ht = i18n.health

  const [title, setTitle] = useState(node?.title || '')
  const [metricType, setMetricType] = useState(existingProps.metric_type || 'Weight')
  const [value, setValue] = useState(existingProps.value || '')
  const [unit, setUnit] = useState(existingProps.unit || '')
  const [date, setDate] = useState(existingProps.date || toLocalDateStr(new Date()))
  const [notes, setNotes] = useState(existingProps.notes || '')
  const [saving, setSaving] = useState(false)

  // Auto-fill unit when metric type changes
  useEffect(() => {
    if (!existingProps.unit) {
      setUnit(DEFAULT_UNITS[metricType] || '')
    }
  }, [metricType, existingProps.unit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const metricLabel = (ht.metrics as Record<string, string>)[metricType] || metricType
    const finalTitle = title.trim() || `${metricLabel} ${date}`
    setSaving(true)
    try {
      await onSave(finalTitle, { metric_type: metricType, value, unit, date, notes })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose}>
      <ModalHeader>
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          {node ? ht.editRecord : ht.newRecord}
        </h3>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="label">{ht.metricType}</label>
              <select
                className="select"
                value={metricType}
                onChange={(e) => setMetricType(e.target.value)}
              >
                {METRIC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {(ht.metrics as Record<string, string>)[t] || t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{ht.value} *</label>
              <input
                className="input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">{ht.unit}</label>
              <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
            <div>
              <label className="label">{ht.date}</label>
              <input
                className="input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">{ht.title}</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={ht.titlePlaceholder}
              />
            </div>
            <div>
              <label className="label">{ht.notes}</label>
              <textarea
                className="textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            {ht.cancel}
          </button>
          <button
            type="submit"
            disabled={saving || !value.trim()}
            className="btn btn-primary flex-1"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              ht.save
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
