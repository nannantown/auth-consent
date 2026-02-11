import { createClient } from './supabase'
import type { Category, Node, Edge } from '@/types/graph'

const NODE_TYPE_SCHEMA_MAP: Record<string, { type: string; additionalType?: string }> = {
  Profile: { type: 'Person' },
  Skill: { type: 'DefinedTerm' },
  WorkExperience: { type: 'OrganizationRole' },
  Goal: { type: 'Thing', additionalType: 'Goal' },
  Contact: { type: 'Person' },
  HealthRecord: { type: 'MedicalRecord' },
  LearningItem: { type: 'Course' },
  FinanceRecord: { type: 'MonetaryAmount' },
  Business: { type: 'Organization' },
  Property: { type: 'Place' },
  Hobby: { type: 'Thing', additionalType: 'Hobby' },
  Product: { type: 'Product' },
  RoadmapItem: { type: 'Thing', additionalType: 'RoadmapItem' },
  KPI: { type: 'Thing', additionalType: 'KPI' },
  Asset: { type: 'Thing', additionalType: 'Asset' },
}

function nodeToJsonLd(node: Node, edges: Edge[], allNodes: Node[]): Record<string, unknown> {
  const mapping = NODE_TYPE_SCHEMA_MAP[node.node_type] || { type: 'Thing' }

  const jsonLd: Record<string, unknown> = {
    '@type': mapping.type,
    '@id': `centra:node/${node.id}`,
    name: node.title || undefined,
    dateCreated: node.created_at,
    dateModified: node.updated_at,
  }

  if (mapping.additionalType) {
    jsonLd.additionalType = mapping.additionalType
  }

  // Map properties
  if (node.properties && typeof node.properties === 'object') {
    const props = node.properties as Record<string, unknown>
    for (const [key, value] of Object.entries(props)) {
      if (value !== null && value !== undefined && value !== '') {
        jsonLd[key] = value
      }
    }
  }

  // Map edges as relationships
  const outgoing = edges.filter((e) => e.source_id === node.id)
  const incoming = edges.filter((e) => e.target_id === node.id)

  if (outgoing.length > 0) {
    const relations = outgoing.map((edge) => {
      const target = allNodes.find((n) => n.id === edge.target_id)
      return {
        '@type': 'Relationship',
        relationshipType: edge.relation_type,
        target: target
          ? { '@id': `centra:node/${target.id}`, name: target.title }
          : { '@id': `centra:node/${edge.target_id}` },
      }
    })
    jsonLd.relatedTo = relations.length === 1 ? relations[0] : relations
  }

  if (incoming.length > 0) {
    const relations = incoming.map((edge) => {
      const source = allNodes.find((n) => n.id === edge.source_id)
      return {
        '@type': 'Relationship',
        relationshipType: edge.relation_type,
        source: source
          ? { '@id': `centra:node/${source.id}`, name: source.title }
          : { '@id': `centra:node/${edge.source_id}` },
      }
    })
    jsonLd.subjectOf = relations.length === 1 ? relations[0] : relations
  }

  return jsonLd
}

export async function exportUserDataAsJsonLD(userId: string): Promise<object> {
  const supabase = createClient()

  // Fetch all user data in parallel
  const [categoriesResult, nodesResult, edgesResult] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true }),
    supabase
      .from('nodes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('display_order', { ascending: true }),
    supabase
      .from('edges')
      .select('*')
      .eq('user_id', userId),
  ])

  const categories: Category[] = categoriesResult.data || []
  const nodes: Node[] = nodesResult.data || []
  const edges: Edge[] = edgesResult.data || []

  // Build JSON-LD items grouped by category
  const itemListElements: object[] = []

  for (const category of categories) {
    const categoryNodes = nodes.filter((n) => n.category_id === category.id)

    const categoryJsonLd: Record<string, unknown> = {
      '@type': 'ItemList',
      '@id': `centra:category/${category.id}`,
      name: category.name,
      alternateName: category.name_en || undefined,
      description: category.description || undefined,
      numberOfItems: categoryNodes.length,
      itemListElement: categoryNodes.map((node) =>
        nodeToJsonLd(node, edges, nodes)
      ),
    }

    itemListElements.push(categoryJsonLd)
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Centra Personal Data Export',
    dateCreated: new Date().toISOString(),
    numberOfItems: itemListElements.length,
    itemListElement: itemListElements,
  }
}
