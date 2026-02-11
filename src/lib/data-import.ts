import { createClient } from './supabase'
import type { CentraExportData } from './data-export'

export interface ImportResult {
  categories: number
  nodes: number
  edges: number
}

function isValidExportData(data: unknown): data is CentraExportData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if (typeof d.version !== 'string') return false
  if (!Array.isArray(d.categories)) return false
  if (!Array.isArray(d.nodes)) return false
  if (!Array.isArray(d.edges)) return false
  return true
}

export async function importUserData(
  userId: string,
  data: CentraExportData
): Promise<ImportResult> {
  if (!isValidExportData(data)) {
    throw new Error('Invalid export data format')
  }

  const supabase = createClient()
  const result: ImportResult = { categories: 0, nodes: 0, edges: 0 }

  // Map old category IDs to new ones
  const categoryIdMap = new Map<string, string>()

  // Import categories
  for (const cat of data.categories) {
    const { data: created, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        slug: cat.slug,
        name: cat.name,
        name_en: cat.name_en,
        icon: cat.icon,
        color: cat.color,
        description: cat.description,
        template_slug: cat.template_slug,
        display_order: cat.display_order,
        is_system: cat.is_system,
      })
      .select()
      .single()

    if (error) {
      console.error('Error importing category:', error)
      continue
    }

    categoryIdMap.set(cat.id, created.id)
    result.categories++
  }

  // Map old node IDs to new ones
  const nodeIdMap = new Map<string, string>()

  // Import nodes
  for (const node of data.nodes) {
    const newCategoryId = categoryIdMap.get(node.category_id)
    if (!newCategoryId) {
      console.error('Category not found for node:', node.id)
      continue
    }

    const { data: created, error } = await supabase
      .from('nodes')
      .insert({
        user_id: userId,
        category_id: newCategoryId,
        node_type: node.node_type,
        title: node.title,
        properties: node.properties,
        display_order: node.display_order,
        is_archived: node.is_archived,
      })
      .select()
      .single()

    if (error) {
      console.error('Error importing node:', error)
      continue
    }

    nodeIdMap.set(node.id, created.id)
    result.nodes++
  }

  // Import edges
  for (const edge of data.edges) {
    const newSourceId = nodeIdMap.get(edge.source_id)
    const newTargetId = nodeIdMap.get(edge.target_id)
    if (!newSourceId || !newTargetId) {
      console.error('Node not found for edge:', edge.id)
      continue
    }

    const { error } = await supabase
      .from('edges')
      .insert({
        user_id: userId,
        source_id: newSourceId,
        target_id: newTargetId,
        relation_type: edge.relation_type,
        properties: edge.properties,
      })

    if (error) {
      console.error('Error importing edge:', error)
      continue
    }

    result.edges++
  }

  return result
}
