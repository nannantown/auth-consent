'use client'

import { useState, useEffect, useMemo } from 'react'
import { getEdges } from '@/lib/graph'
import { useI18n } from '@/lib/i18n'
import type { Node, Edge } from '@/types/graph'

interface GraphViewProps {
  nodes: Node[]
  userId: string
}

interface LayoutNode {
  id: string
  x: number
  y: number
  title: string
  nodeType: string
  color: string
}

interface LayoutEdge {
  id: string
  sourceId: string
  targetId: string
  relationType: string
}

const COLUMN_COUNT = 3
const NODE_WIDTH = 120
const NODE_HEIGHT = 50
const H_GAP = 40
const V_GAP = 40
const PADDING = 30

function nodeTypeToColor(nodeType: string): string {
  let hash = 0
  for (let i = 0; i < nodeType.length; i++) {
    hash = nodeType.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 45%, 55%)`
}

export function GraphView({ nodes, userId }: GraphViewProps) {
  const { t } = useI18n()
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadEdges() {
      setLoading(true)
      const allEdges: Edge[] = []
      const seen = new Set<string>()

      const results = await Promise.all(
        nodes.map((node) => getEdges(node.id))
      )

      for (const nodeEdges of results) {
        for (const edge of nodeEdges) {
          if (!seen.has(edge.id)) {
            seen.add(edge.id)
            allEdges.push(edge)
          }
        }
      }

      if (!cancelled) {
        setEdges(allEdges)
        setLoading(false)
      }
    }

    if (nodes.length > 0) {
      loadEdges()
    } else {
      setEdges([])
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [nodes])

  const layoutNodes = useMemo<LayoutNode[]>(() => {
    return nodes.map((node, index) => {
      const col = index % COLUMN_COUNT
      const row = Math.floor(index / COLUMN_COUNT)
      return {
        id: node.id,
        x: PADDING + col * (NODE_WIDTH + H_GAP),
        y: PADDING + row * (NODE_HEIGHT + V_GAP),
        title: node.title || node.node_type,
        nodeType: node.node_type,
        color: nodeTypeToColor(node.node_type),
      }
    })
  }, [nodes])

  const nodePositionMap = useMemo(() => {
    const map = new Map<string, LayoutNode>()
    for (const ln of layoutNodes) {
      map.set(ln.id, ln)
    }
    return map
  }, [layoutNodes])

  const layoutEdges = useMemo<LayoutEdge[]>(() => {
    const nodeIdSet = new Set(nodes.map((n) => n.id))
    return edges
      .filter((e) => nodeIdSet.has(e.source_id) && nodeIdSet.has(e.target_id))
      .map((e) => ({
        id: e.id,
        sourceId: e.source_id,
        targetId: e.target_id,
        relationType: e.relation_type,
      }))
  }, [edges, nodes])

  const rows = Math.ceil(nodes.length / COLUMN_COUNT)
  const svgWidth = PADDING * 2 + COLUMN_COUNT * NODE_WIDTH + (COLUMN_COUNT - 1) * H_GAP
  const svgHeight = PADDING * 2 + rows * NODE_HEIGHT + Math.max(0, rows - 1) * V_GAP

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-10 h-10 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: 'var(--text-muted)', opacity: 0.3 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {t.nodes.noNodes}
        </p>
      </div>
    )
  }

  return (
    <div
      className="overflow-auto rounded-md"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ display: 'block', minWidth: svgWidth }}
      >
        {/* Edges */}
        {layoutEdges.map((edge) => {
          const source = nodePositionMap.get(edge.sourceId)
          const target = nodePositionMap.get(edge.targetId)
          if (!source || !target) return null

          const x1 = source.x + NODE_WIDTH / 2
          const y1 = source.y + NODE_HEIGHT / 2
          const x2 = target.x + NODE_WIDTH / 2
          const y2 = target.y + NODE_HEIGHT / 2
          const mx = (x1 + x2) / 2
          const my = (y1 + y2) / 2

          const isHighlighted =
            selectedNodeId === edge.sourceId || selectedNodeId === edge.targetId

          return (
            <g key={edge.id}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isHighlighted ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)'}
                strokeWidth={isHighlighted ? 1.5 : 1}
              />
              <text
                x={mx}
                y={my - 6}
                textAnchor="middle"
                fontSize={9}
                fill="var(--text-muted)"
              >
                {edge.relationType}
              </text>
            </g>
          )
        })}

        {/* Nodes */}
        {layoutNodes.map((ln) => {
          const isSelected = selectedNodeId === ln.id
          const truncatedTitle =
            ln.title.length > 14 ? ln.title.slice(0, 13) + '...' : ln.title

          return (
            <g
              key={ln.id}
              onClick={() => setSelectedNodeId(isSelected ? null : ln.id)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={ln.x}
                y={ln.y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={8}
                ry={8}
                fill={isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}
                stroke={isSelected ? ln.color : 'rgba(255,255,255,0.1)'}
                strokeWidth={isSelected ? 1.5 : 1}
              />
              <text
                x={ln.x + NODE_WIDTH / 2}
                y={ln.y + 22}
                textAnchor="middle"
                fontSize={11}
                fontWeight={500}
                fill="var(--text-primary)"
              >
                {truncatedTitle}
              </text>
              <text
                x={ln.x + NODE_WIDTH / 2}
                y={ln.y + 38}
                textAnchor="middle"
                fontSize={9}
                fill={ln.color}
              >
                {ln.nodeType}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
