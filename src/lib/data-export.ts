import { getCategories, getNodes, getEdges } from './graph'
import { createClient } from './supabase'
import type { Category, Node, Edge } from '@/types/graph'

export interface CentraExportData {
  version: string
  exported_at: string
  categories: Category[]
  nodes: Node[]
  edges: Edge[]
}

export async function exportUserData(userId: string): Promise<CentraExportData> {
  const categories = await getCategories(userId)
  const nodes = await getNodes(userId, { includeArchived: true })

  // Collect all edges from all nodes, deduplicated
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

  return {
    version: '1.0',
    exported_at: new Date().toISOString(),
    categories,
    nodes,
    edges: allEdges,
  }
}
