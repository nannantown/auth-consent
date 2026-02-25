'use client'

import { NeighborhoodExplorer } from './NeighborhoodExplorer'
import type { Node } from '@/types/graph'

interface GraphViewProps {
  nodes: Node[]
  userId: string
}

export function GraphView({ nodes, userId }: GraphViewProps) {
  return (
    <NeighborhoodExplorer
      userId={userId}
      nodes={nodes}
    />
  )
}
