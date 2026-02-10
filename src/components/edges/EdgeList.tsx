'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { getRelatedNodes, deleteEdge, getEdges } from '@/lib/graph'
import type { Node, Edge } from '@/types/graph'

interface RelatedNode extends Node {
  relation_type: string
  edge_direction: 'outgoing' | 'incoming'
}

interface EdgeListProps {
  nodeId: string
  onAddRelation: () => void
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

export function EdgeList({ nodeId, onAddRelation }: EdgeListProps) {
  const { t, language } = useI18n()
  const [relatedNodes, setRelatedNodes] = useState<RelatedNode[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [loading, setLoading] = useState(true)

  const loadRelations = async () => {
    try {
      const [nodes, edgeData] = await Promise.all([
        getRelatedNodes(nodeId),
        getEdges(nodeId),
      ])
      setRelatedNodes(nodes)
      setEdges(edgeData)
    } catch (error) {
      console.error('Failed to load relations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRelations()
  }, [nodeId])

  const handleRemoveEdge = async (relatedNodeId: string) => {
    const edge = edges.find(
      (e) =>
        (e.source_id === nodeId && e.target_id === relatedNodeId) ||
        (e.target_id === nodeId && e.source_id === relatedNodeId)
    )
    if (!edge) return

    const success = await deleteEdge(edge.id)
    if (success) {
      loadRelations()
    }
  }

  const getRelationLabel = (type: string) => {
    const labels = RELATION_LABELS[type]
    if (labels) return language === 'en' ? labels.en : labels.ja
    return type
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div
          className="w-3 h-3 rounded-full border border-t-transparent animate-spin"
          style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
        />
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {t.loading}
        </span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="label">{t.nodes.relations}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onAddRelation()
          }}
          className="flex items-center gap-1 text-[10px] transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          {t.nodes.addRelation}
        </button>
      </div>

      {relatedNodes.length === 0 ? (
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {t.nodes.noRelations}
        </p>
      ) : (
        <div className="space-y-1.5">
          {relatedNodes.map((rn) => (
            <div
              key={rn.id}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span
                className="text-[10px] flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {rn.edge_direction === 'outgoing' ? '→' : '←'}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-muted)',
                }}
              >
                {getRelationLabel(rn.relation_type)}
              </span>
              <span
                className="text-xs flex-1 truncate"
                style={{ color: 'var(--text-secondary)' }}
              >
                {rn.title || rn.node_type}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveEdge(rn.id)
                }}
                className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
