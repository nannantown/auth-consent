'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import type { Node } from '@/types/graph'

interface NodeCardProps {
  node: Node
  onEdit: (node: Node) => void
  onDelete: (node: Node) => void
}

export function NodeCard({ node, onEdit, onDelete }: NodeCardProps) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)

  const propertyEntries = Object.entries(node.properties).filter(
    ([, v]) => v !== null && v !== undefined && v !== ''
  )
  const propertySummary = propertyEntries
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(', ')

  const createdDate = new Date(node.created_at).toLocaleDateString()

  return (
    <div
      className="card-interactive px-4 py-3"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {node.title || t.nodes.title}
            </span>
            <span
              className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-muted)',
              }}
            >
              {node.node_type}
            </span>
          </div>
          {!expanded && propertySummary && (
            <p
              className="text-xs mt-1 truncate"
              style={{ color: 'var(--text-muted)' }}
            >
              {propertySummary}
            </p>
          )}
          {!expanded && (
            <p
              className="text-[10px] mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {t.nodes.createdAt} {createdDate}
            </p>
          )}
        </div>

        <div
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center transition-transform"
          style={{
            color: 'var(--text-muted)',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3">
          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="mb-3" />

          {/* Properties */}
          {propertyEntries.length > 0 && (
            <div className="space-y-2 mb-3">
              <span className="label">{t.nodes.properties}</span>
              {propertyEntries.map(([key, value]) => (
                <div key={key} className="flex items-baseline gap-2 text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>{key}:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Created date */}
          <p
            className="text-[10px] mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {t.nodes.createdAt} {createdDate}
          </p>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="mb-3" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(node)
              }}
              className="btn btn-secondary text-xs px-3 py-1.5"
            >
              {t.nodes.edit}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(node)
              }}
              className="btn btn-ghost text-xs px-3 py-1.5"
              style={{ color: 'var(--error)' }}
            >
              {t.nodes.delete}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
