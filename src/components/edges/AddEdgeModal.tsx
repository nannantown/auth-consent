'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { getNodes, createEdge } from '@/lib/graph'
import { RELATION_TYPES } from '@/types/graph'
import type { Node, Edge } from '@/types/graph'

interface AddEdgeModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (edge: Edge) => void
  sourceNodeId: string
  userId: string
  excludeNodeIds?: string[]
}

const RELATION_LABELS: Record<string, { ja: string; en: string }> = {
  related_to: { ja: '関連', en: 'Related to' },
  has_skill: { ja: 'スキル', en: 'Has skill' },
  part_of: { ja: '所属', en: 'Part of' },
  requires: { ja: '必要', en: 'Requires' },
  achieved_by: { ja: '達成', en: 'Achieved by' },
  tracks: { ja: 'トラッキング', en: 'Tracks' },
  contacts: { ja: '連絡先', en: 'Contacts' },
}

export function AddEdgeModal({
  isOpen,
  onClose,
  onCreated,
  sourceNodeId,
  userId,
  excludeNodeIds = [],
}: AddEdgeModalProps) {
  const { t, language } = useI18n()
  const [allNodes, setAllNodes] = useState<Node[]>([])
  const [search, setSearch] = useState('')
  const [relationType, setRelationType] = useState<string>(RELATION_TYPES[0])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setRelationType(RELATION_TYPES[0])
      setSelectedNodeId(null)
      loadNodes()
    }
  }, [isOpen])

  const loadNodes = async () => {
    setLoading(true)
    try {
      const nodes = await getNodes(userId)
      setAllNodes(nodes)
    } catch (error) {
      console.error('Failed to load nodes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const excludeSet = new Set([sourceNodeId, ...excludeNodeIds])
  const filteredNodes = allNodes
    .filter((n) => !excludeSet.has(n.id))
    .filter((n) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        (n.title || '').toLowerCase().includes(q) ||
        n.node_type.toLowerCase().includes(q)
      )
    })

  const getRelationLabel = (type: string) => {
    const labels = RELATION_LABELS[type]
    if (labels) return language === 'en' ? labels.en : labels.ja
    return type
  }

  const handleSubmit = async () => {
    if (!selectedNodeId) return
    setSaving(true)
    try {
      const edge = await createEdge(userId, {
        source_id: sourceNodeId,
        target_id: selectedNodeId,
        relation_type: relationType,
      })
      if (edge) {
        onCreated(edge)
        onClose()
      }
    } catch (error) {
      console.error('Failed to create edge:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        onClick={() => !saving && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg max-h-[80vh] overflow-hidden animate-scale-in"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <h2
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {t.nodes.addRelation}
            </h2>
            <button
              onClick={() => !saving && onClose()}
              className="w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4 overflow-y-auto max-h-[calc(80vh-130px)]">
            {/* Relation Type */}
            <div className="mb-4">
              <label className="label block mb-1.5">{t.nodes.relationType}</label>
              <select
                value={relationType}
                onChange={(e) => setRelationType(e.target.value)}
                className="input"
                disabled={saving}
              >
                {RELATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getRelationLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="mb-3">
              <label className="label block mb-1.5">{t.nodes.selectNode}</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.nodes.searchNodes}
                className="input"
                disabled={saving}
              />
            </div>

            {/* Node list */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div
                  className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
                />
              </div>
            ) : filteredNodes.length === 0 ? (
              <p
                className="text-xs text-center py-6"
                style={{ color: 'var(--text-muted)' }}
              >
                {t.nodes.noNodes}
              </p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {filteredNodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNodeId(node.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left transition-colors"
                    style={{
                      background:
                        selectedNodeId === node.id
                          ? 'var(--active-bg)'
                          : 'transparent',
                      border:
                        selectedNodeId === node.id
                          ? '1px solid var(--border-strong)'
                          : '1px solid transparent',
                    }}
                    disabled={saving}
                  >
                    <span
                      className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {node.node_type}
                    </span>
                    <span
                      className="text-xs truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {node.title || node.node_type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => !saving && onClose()}
                disabled={saving}
                className="btn btn-secondary flex-1 text-sm"
              >
                {t.nodes.cancel}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !selectedNodeId}
                className="btn btn-primary flex-1 text-sm disabled:opacity-40"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    {t.nodes.saving}
                  </span>
                ) : (
                  t.nodes.addRelation
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
