'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getRelatedNodes } from '@/lib/graph'
import type { Node } from '@/types/graph'

interface NeighborhoodExplorerProps {
  userId: string
  nodes: Node[]
  onNodeSelect?: (node: Node) => void
}

type RelatedNode = Node & { relation_type: string; edge_direction: 'outgoing' | 'incoming' }

function nodeTypeToColor(nodeType: string): string {
  let hash = 0
  for (let i = 0; i < nodeType.length; i++) {
    hash = nodeType.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 45%, 55%)`
}

const CENTER_X = 250
const CENTER_Y = 200
const ORBIT_RADIUS = 140
const CENTER_NODE_RADIUS = 32
const SATELLITE_NODE_RADIUS = 24

export function NeighborhoodExplorer({ nodes, onNodeSelect }: NeighborhoodExplorerProps) {
  const [centerId, setCenterId] = useState<string | null>(null)
  const [relatedNodes, setRelatedNodes] = useState<RelatedNode[]>([])
  const [loading, setLoading] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const centerNode = useMemo(
    () => nodes.find((n) => n.id === centerId) || null,
    [nodes, centerId]
  )

  // Load related nodes when center changes
  const loadRelated = useCallback(async (nodeId: string) => {
    setLoading(true)
    try {
      const related = await getRelatedNodes(nodeId)
      setRelatedNodes(related)
    } catch {
      setRelatedNodes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (centerId) {
      loadRelated(centerId)
    } else {
      setRelatedNodes([])
    }
  }, [centerId, loadRelated])

  // Auto-select first node if none selected
  useEffect(() => {
    if (!centerId && nodes.length > 0) {
      setCenterId(nodes[0].id)
    }
  }, [centerId, nodes])

  const handleNodeClick = (node: Node | RelatedNode) => {
    setCenterId(node.id)
    onNodeSelect?.(node)
  }

  // Calculate satellite positions
  const satellites = useMemo(() => {
    const count = relatedNodes.length
    if (count === 0) return []
    return relatedNodes.map((node, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2
      return {
        ...node,
        x: CENTER_X + ORBIT_RADIUS * Math.cos(angle),
        y: CENTER_Y + ORBIT_RADIUS * Math.sin(angle),
      }
    })
  }, [relatedNodes])

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
          No nodes to display
        </p>
      </div>
    )
  }

  const svgWidth = 500
  const svgHeight = 400

  return (
    <div className="space-y-3">
      {/* Node selector pills */}
      <div className="flex flex-wrap gap-1.5">
        {nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => handleNodeClick(node)}
            className="px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150"
            style={{
              background: centerId === node.id ? '#fff' : 'rgba(255,255,255,0.06)',
              color: centerId === node.id ? '#000' : 'var(--text-secondary)',
              border: `1px solid ${centerId === node.id ? '#fff' : 'rgba(255,255,255,0.12)'}`,
            }}
          >
            {node.title || node.node_type}
          </button>
        ))}
      </div>

      {/* Graph visualization */}
      <div
        className="overflow-auto rounded-md"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: svgHeight }}>
            <div
              className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : (
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ display: 'block', minWidth: svgWidth }}
          >
            {/* Orbit circle (subtle guide) */}
            {centerNode && satellites.length > 0 && (
              <circle
                cx={CENTER_X}
                cy={CENTER_Y}
                r={ORBIT_RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            )}

            {/* Edge lines */}
            {satellites.map((sat) => {
              const isHovered = hoveredId === sat.id
              return (
                <g key={`edge-${sat.id}`}>
                  <line
                    x1={CENTER_X}
                    y1={CENTER_Y}
                    x2={sat.x}
                    y2={sat.y}
                    stroke={isHovered ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)'}
                    strokeWidth={isHovered ? 1.5 : 1}
                  />
                  {/* Direction arrow indicator */}
                  {(() => {
                    const mx = (CENTER_X + sat.x) / 2
                    const my = (CENTER_Y + sat.y) / 2
                    const dirLabel = sat.edge_direction === 'outgoing' ? '\u2192' : '\u2190'
                    return (
                      <>
                        <text
                          x={mx}
                          y={my - 8}
                          textAnchor="middle"
                          fontSize={9}
                          fill={isHovered ? 'var(--text-secondary)' : 'var(--text-muted)'}
                        >
                          {sat.relation_type}
                        </text>
                        <text
                          x={mx}
                          y={my + 6}
                          textAnchor="middle"
                          fontSize={8}
                          fill="var(--text-muted)"
                        >
                          {dirLabel}
                        </text>
                      </>
                    )
                  })()}
                </g>
              )
            })}

            {/* Satellite nodes */}
            {satellites.map((sat) => {
              const color = nodeTypeToColor(sat.node_type)
              const isHovered = hoveredId === sat.id
              const label = sat.title || sat.node_type
              const truncated = label.length > 10 ? label.slice(0, 9) + '..' : label

              return (
                <g
                  key={`node-${sat.id}`}
                  onClick={() => handleNodeClick(sat)}
                  onMouseEnter={() => setHoveredId(sat.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={sat.x}
                    cy={sat.y}
                    r={SATELLITE_NODE_RADIUS}
                    fill={isHovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}
                    stroke={isHovered ? color : 'rgba(255,255,255,0.1)'}
                    strokeWidth={isHovered ? 1.5 : 1}
                  />
                  <text
                    x={sat.x}
                    y={sat.y - 2}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={500}
                    fill="var(--text-primary)"
                  >
                    {truncated}
                  </text>
                  <text
                    x={sat.x}
                    y={sat.y + 10}
                    textAnchor="middle"
                    fontSize={8}
                    fill={color}
                  >
                    {sat.node_type}
                  </text>
                </g>
              )
            })}

            {/* Center node */}
            {centerNode && (
              <g>
                <circle
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  r={CENTER_NODE_RADIUS}
                  fill="rgba(255,255,255,0.1)"
                  stroke={nodeTypeToColor(centerNode.node_type)}
                  strokeWidth={2}
                />
                <text
                  x={CENTER_X}
                  y={CENTER_Y - 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="var(--text-primary)"
                >
                  {(centerNode.title || centerNode.node_type).length > 12
                    ? (centerNode.title || centerNode.node_type).slice(0, 11) + '..'
                    : centerNode.title || centerNode.node_type}
                </text>
                <text
                  x={CENTER_X}
                  y={CENTER_Y + 10}
                  textAnchor="middle"
                  fontSize={9}
                  fill={nodeTypeToColor(centerNode.node_type)}
                >
                  {centerNode.node_type}
                </text>
              </g>
            )}

            {/* No connections message */}
            {centerNode && satellites.length === 0 && (
              <text
                x={CENTER_X}
                y={CENTER_Y + CENTER_NODE_RADIUS + 24}
                textAnchor="middle"
                fontSize={10}
                fill="var(--text-muted)"
              >
                No connections
              </text>
            )}
          </svg>
        )}
      </div>
    </div>
  )
}
