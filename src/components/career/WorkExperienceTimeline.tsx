'use client'

import { useState } from 'react'
import type { Node } from '@/types/graph'
import { WorkExperienceForm } from './WorkExperienceForm'
import { ConfirmDialog } from '@ground/ui'

interface WorkExperienceTimelineProps {
  nodes: Node[]
  onAdd: (data: { title: string; properties: Record<string, unknown> }) => Promise<void>
  onEdit: (nodeId: string, data: { title: string; properties: Record<string, unknown> }) => Promise<void>
  onDelete: (nodeId: string) => Promise<void>
  language: string
}

function formatPeriod(startDate: string, endDate?: string, language?: string): string {
  const formatMonth = (date: string) => {
    const [year, month] = date.split('-')
    return language === 'en' ? `${month}/${year}` : `${year}/${month}`
  }

  const start = formatMonth(startDate)
  const end = endDate ? formatMonth(endDate) : (language === 'en' ? 'Present' : '現在')
  return `${start} - ${end}`
}

function calculateDuration(startDate: string, endDate?: string, language?: string): string {
  const start = new Date(startDate + '-01')
  const end = endDate ? new Date(endDate + '-01') : new Date()
  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  if (language === 'en') {
    if (years === 0) return `${months}mo`
    if (months === 0) return `${years}yr`
    return `${years}yr ${months}mo`
  }
  if (years === 0) return `${months}ヶ月`
  if (months === 0) return `${years}年`
  return `${years}年${months}ヶ月`
}

function sortByStartDate(nodes: Node[]): Node[] {
  return [...nodes].sort((a, b) => {
    const aDate = (a.properties as { start_date?: string }).start_date || ''
    const bDate = (b.properties as { start_date?: string }).start_date || ''
    return bDate.localeCompare(aDate)
  })
}

export function WorkExperienceTimeline({
  nodes,
  onAdd,
  onEdit,
  onDelete,
  language,
}: WorkExperienceTimelineProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sortedNodes = sortByStartDate(nodes)
  const deletingNode = deletingId ? nodes.find((n) => n.id === deletingId) : null

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-translucent)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(59, 130, 246, 0.15)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#3b82f6' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {language === 'en' ? 'Work Experience' : '職歴'}
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: 'var(--bg-surface-hover)',
              color: 'var(--text-muted)',
            }}
          >
            {nodes.length}
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
          style={{ color: '#3b82f6' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'en' ? 'Add' : '追加'}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {nodes.length === 0 && !showAddForm ? (
          <div
            className="text-center py-8 rounded-xl"
            style={{
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border-default)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {language === 'en' ? 'No work experience yet' : '職歴がまだありません'}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-sm font-medium"
              style={{ color: '#3b82f6' }}
            >
              {language === 'en' ? 'Add your first experience' : '最初の職歴を追加'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {showAddForm && (
              <div className="mb-4">
                <WorkExperienceForm
                  onSave={async (data) => {
                    await onAdd(data)
                    setShowAddForm(false)
                  }}
                  onCancel={() => setShowAddForm(false)}
                  language={language}
                />
              </div>
            )}

            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              {sortedNodes.length > 0 && (
                <div
                  className="absolute left-[15px] top-3 bottom-3 w-px"
                  style={{ background: 'var(--border-default)' }}
                />
              )}

              {sortedNodes.map((node, index) => {
                const props = node.properties as {
                  company?: string
                  role?: string
                  start_date?: string
                  end_date?: string
                  description?: string
                  achievements?: string
                }

                const isCurrent = !props.end_date

                if (editingId === node.id) {
                  return (
                    <div key={node.id} className="mb-3 pl-10">
                      <WorkExperienceForm
                        node={node}
                        onSave={async (data) => {
                          await onEdit(node.id, data)
                          setEditingId(null)
                        }}
                        onCancel={() => setEditingId(null)}
                        language={language}
                      />
                    </div>
                  )
                }

                return (
                  <div
                    key={node.id}
                    className={`relative flex gap-4 pb-4 animate-fade-in stagger-${Math.min(index + 1, 6)}`}
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0 mt-1">
                      <div
                        className="w-[9px] h-[9px] rounded-full ring-2"
                        style={{
                          background: isCurrent ? '#3b82f6' : 'var(--bg-card)',
                          borderColor: isCurrent ? '#3b82f6' : 'var(--border-default)',
                          marginLeft: '11px',
                          boxShadow: isCurrent ? '0 0 0 3px rgba(59, 130, 246, 0.3)' : 'none',
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 rounded-xl p-4 transition-colors hover:bg-white/[0.02] group"
                      style={{
                        background: 'var(--bg-surface)',
                        border: `1px solid ${isCurrent ? 'rgba(59, 130, 246, 0.2)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {props.role}
                            </h4>
                            {isCurrent && (
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{
                                  background: 'rgba(59, 130, 246, 0.15)',
                                  color: '#3b82f6',
                                }}
                              >
                                {language === 'en' ? 'Current' : '現職'}
                              </span>
                            )}
                          </div>
                          <p
                            className="text-sm mt-0.5"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {props.company}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {props.start_date && formatPeriod(props.start_date, props.end_date, language)}
                            </span>
                            {props.start_date && (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{
                                  background: 'var(--bg-surface-hover)',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                {calculateDuration(props.start_date, props.end_date, language)}
                              </span>
                            )}
                          </div>
                          {props.description && (
                            <p
                              className="text-xs mt-2 line-clamp-2"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {props.description}
                            </p>
                          )}
                          {props.achievements && (
                            <p
                              className="text-xs mt-1 line-clamp-2"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {props.achievements}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingId(node.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingId(node.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => {
          if (deletingId) await onDelete(deletingId)
          setDeletingId(null)
        }}
        title={language === 'en' ? 'Delete Work Experience' : '職歴を削除'}
        message={
          language === 'en'
            ? `Delete "${deletingNode?.title}"? This cannot be undone.`
            : `「${deletingNode?.title}」を削除しますか？この操作は取り消せません。`
        }
        confirmLabel={language === 'en' ? 'Delete' : '削除'}
        cancelLabel={language === 'en' ? 'Cancel' : 'キャンセル'}
        variant="danger"
      />
    </div>
  )
}
