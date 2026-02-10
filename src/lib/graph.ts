import { createClient } from './supabase'
import type {
  Category,
  CategoryInput,
  Node,
  NodeInput,
  Edge,
  EdgeInput,
  SharingRule,
  SharingRuleInput,
  CategoryWithNodes,
} from '@/types/graph'

// ============================================
// Categories (Spaces)
// ============================================

export async function getCategories(userId: string): Promise<Category[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export async function getCategoryBySlug(
  userId: string,
  slug: string
): Promise<Category | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching category:', error)
    return null
  }

  return data
}

export async function createCategory(
  userId: string,
  input: CategoryInput
): Promise<Category | null> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from('categories')
    .select('display_order')
    .eq('user_id', userId)
    .order('display_order', { ascending: false })
    .limit(1)

  const maxOrder = existing?.[0]?.display_order ?? -1

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      ...input,
      display_order: input.display_order ?? maxOrder + 1,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    return null
  }

  return data
}

export async function updateCategory(
  categoryId: string,
  input: Partial<CategoryInput>
): Promise<Category | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('categories')
    .update(input)
    .eq('id', categoryId)
    .select()
    .single()

  if (error) {
    console.error('Error updating category:', error)
    return null
  }

  return data
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    console.error('Error deleting category:', error)
    return false
  }

  return true
}

export async function reorderCategories(
  userId: string,
  orderedIds: string[]
): Promise<boolean> {
  const supabase = createClient()

  const updates = orderedIds.map((id, index) =>
    supabase
      .from('categories')
      .update({ display_order: index })
      .eq('id', id)
      .eq('user_id', userId)
  )

  const results = await Promise.all(updates)
  return !results.some((r) => r.error)
}

// ============================================
// Categories with Nodes
// ============================================

export async function getCategoryWithNodes(
  categoryId: string
): Promise<CategoryWithNodes | null> {
  const supabase = createClient()

  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (catError) {
    console.error('Error fetching category:', catError)
    return null
  }

  const { data: nodes, error: nodesError } = await supabase
    .from('nodes')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_archived', false)
    .order('display_order', { ascending: true })

  if (nodesError) {
    console.error('Error fetching nodes:', nodesError)
    return null
  }

  return { ...category, nodes: nodes || [] }
}

// ============================================
// Nodes
// ============================================

export async function getNodes(
  userId: string,
  options?: {
    categoryId?: string
    nodeType?: string
    includeArchived?: boolean
  }
): Promise<Node[]> {
  const supabase = createClient()

  let query = supabase
    .from('nodes')
    .select('*')
    .eq('user_id', userId)

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }

  if (options?.nodeType) {
    query = query.eq('node_type', options.nodeType)
  }

  if (!options?.includeArchived) {
    query = query.eq('is_archived', false)
  }

  const { data, error } = await query.order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching nodes:', error)
    return []
  }

  return data || []
}

export async function getNode(nodeId: string): Promise<Node | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('id', nodeId)
    .single()

  if (error) {
    console.error('Error fetching node:', error)
    return null
  }

  return data
}

export async function createNode(
  userId: string,
  input: NodeInput
): Promise<Node | null> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from('nodes')
    .select('display_order')
    .eq('category_id', input.category_id)
    .eq('user_id', userId)
    .order('display_order', { ascending: false })
    .limit(1)

  const maxOrder = existing?.[0]?.display_order ?? -1

  const { data, error } = await supabase
    .from('nodes')
    .insert({
      user_id: userId,
      ...input,
      properties: input.properties ?? {},
      display_order: input.display_order ?? maxOrder + 1,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating node:', error)
    return null
  }

  return data
}

export async function updateNode(
  nodeId: string,
  input: Partial<NodeInput>
): Promise<Node | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nodes')
    .update(input)
    .eq('id', nodeId)
    .select()
    .single()

  if (error) {
    console.error('Error updating node:', error)
    return null
  }

  return data
}

export async function deleteNode(nodeId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('nodes')
    .delete()
    .eq('id', nodeId)

  if (error) {
    console.error('Error deleting node:', error)
    return false
  }

  return true
}

export async function archiveNode(nodeId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('nodes')
    .update({ is_archived: true })
    .eq('id', nodeId)

  if (error) {
    console.error('Error archiving node:', error)
    return false
  }

  return true
}

// ============================================
// Edges (Relations)
// ============================================

export async function getEdges(
  nodeId: string
): Promise<Edge[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('edges')
    .select('*')
    .or(`source_id.eq.${nodeId},target_id.eq.${nodeId}`)

  if (error) {
    console.error('Error fetching edges:', error)
    return []
  }

  return data || []
}

export async function createEdge(
  userId: string,
  input: EdgeInput
): Promise<Edge | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('edges')
    .insert({
      user_id: userId,
      ...input,
      properties: input.properties ?? {},
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating edge:', error)
    return null
  }

  return data
}

export async function deleteEdge(edgeId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('edges')
    .delete()
    .eq('id', edgeId)

  if (error) {
    console.error('Error deleting edge:', error)
    return false
  }

  return true
}

// ============================================
// Related Nodes (Graph Traversal)
// ============================================

export async function getRelatedNodes(
  nodeId: string
): Promise<(Node & { relation_type: string; edge_direction: 'outgoing' | 'incoming' })[]> {
  const supabase = createClient()

  // Get edges where this node is source or target
  const { data: edges, error: edgesError } = await supabase
    .from('edges')
    .select('*')
    .or(`source_id.eq.${nodeId},target_id.eq.${nodeId}`)

  if (edgesError || !edges?.length) return []

  // Collect related node IDs
  const relatedNodeIds = edges.map((e) =>
    e.source_id === nodeId ? e.target_id : e.source_id
  )

  const { data: nodes, error: nodesError } = await supabase
    .from('nodes')
    .select('*')
    .in('id', relatedNodeIds)

  if (nodesError || !nodes) return []

  // Map nodes with relation info
  return nodes.map((node) => {
    const edge = edges.find(
      (e) => e.source_id === node.id || e.target_id === node.id
    )!
    return {
      ...node,
      relation_type: edge.relation_type,
      edge_direction: edge.source_id === nodeId ? 'outgoing' : 'incoming',
    }
  })
}

// ============================================
// Sharing Rules
// ============================================

export async function getSharingRules(
  userId: string
): Promise<SharingRule[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sharing_rules')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching sharing rules:', error)
    return []
  }

  return data || []
}

export async function upsertSharingRule(
  userId: string,
  input: SharingRuleInput
): Promise<SharingRule | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sharing_rules')
    .upsert({
      user_id: userId,
      ...input,
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting sharing rule:', error)
    return null
  }

  return data
}

// ============================================
// Profile Helpers (backward compatibility)
// ============================================

export async function getProfileNode(userId: string): Promise<Node | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('node_type', 'Profile')
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching profile node:', error)
    return null
  }

  return data
}
