import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { SharingRule, Node } from '@/types/graph'

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.')
  let current: Record<string, unknown> = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {}
    }
    current = current[keys[i]] as Record<string, unknown>
  }
  current[keys[keys.length - 1]] = value
}

function filterProperties(
  properties: Record<string, unknown>,
  allowedPaths: string[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const path of allowedPaths) {
    const value = getNestedValue(properties, path)
    if (value !== undefined) {
      setNestedValue(result, path, value)
    }
  }
  return result
}

type ApiNode = Pick<Node, 'id' | 'node_type' | 'title' | 'properties' | 'category_id' | 'created_at' | 'updated_at'>

function applyPropertyFiltering(
  nodes: ApiNode[],
  sharingRules: SharingRule[]
): ApiNode[] {
  return nodes.map((node) => {
    const matchingRules = sharingRules.filter((r) => {
      if (r.node_id && r.node_id === node.id) return true
      if (r.category_id === node.category_id) {
        if (r.node_type && r.node_type === node.node_type) return true
        if (!r.node_type && !r.node_id) return true
      }
      return false
    })

    const allowedPaths = matchingRules
      .map((r) => r.property_path)
      .filter((p): p is string => p != null)

    // If no rule specifies property_path, return full properties (backward compatible)
    if (allowedPaths.length === 0) return node

    return {
      ...node,
      properties: filterProperties(node.properties || {}, allowedPaths),
    }
  })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ scope: string }> }
) {
  const { scope } = await params

  // Parse pagination parameters
  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10)))
  const offset = (page - 1) * limit

  // Extract Bearer token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header' },
      { status: 401 }
    )
  }

  const token = authHeader.slice(7)

  // Validate token with Supabase
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser(token)

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  // Fetch sharing rules for the user
  const { data: sharingRules, error: rulesError } = await supabase
    .from('sharing_rules')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_shareable', true)

  if (rulesError) {
    return NextResponse.json(
      { error: 'Failed to fetch sharing rules' },
      { status: 500 }
    )
  }

  if (!sharingRules || sharingRules.length === 0) {
    return NextResponse.json({ data: [], scope, user_id: user.id })
  }

  // Determine which categories/types are shareable
  const shareableCategoryIds = sharingRules
    .filter((r) => r.category_id && !r.node_type && !r.node_id)
    .map((r) => r.category_id)

  const shareableTypeRules = sharingRules
    .filter((r) => r.category_id && r.node_type && !r.node_id)

  // Fetch categories if needed
  let categories: Record<string, unknown>[] | null = null
  if (scope === 'all' || scope === 'categories') {
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .select('id, slug, name, name_en, icon, color, description')
      .eq('user_id', user.id)
      .in('id', shareableCategoryIds)

    if (catError) {
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    categories = catData

    if (scope === 'categories') {
      return NextResponse.json({ data: categories, scope, user_id: user.id })
    }
  }

  // For specific scope (category slug), resolve category first
  let scopeCategoryId: string | null = null
  if (scope !== 'all' && scope !== 'nodes' && scope !== 'categories') {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', scope)
      .single()

    if (!category) {
      return NextResponse.json(
        { error: `Scope "${scope}" not found` },
        { status: 404 }
      )
    }
    scopeCategoryId = category.id
  }

  // Build sharing filters for nodes query
  const categoryFilters = shareableCategoryIds.map(
    (id: string) => `category_id.eq.${id}`
  )
  const typeFilters = shareableTypeRules.map(
    (r) => `and(category_id.eq.${r.category_id},node_type.eq.${r.node_type})`
  )
  const allFilters = [...categoryFilters, ...typeFilters]

  if (allFilters.length === 0) {
    return NextResponse.json({
      data: { categories: [], nodes: [] },
      pagination: { page, limit, total: 0, has_more: false },
      scope,
      user_id: user.id,
    })
  }

  // Build nodes query with specific fields and pagination
  let nodeQuery = supabase
    .from('nodes')
    .select('id, node_type, title, properties, category_id, created_at, updated_at', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .or(allFilters.join(','))

  // Apply category scope filter if specific slug
  if (scopeCategoryId) {
    nodeQuery = nodeQuery.eq('category_id', scopeCategoryId)
  }

  // Apply pagination
  nodeQuery = nodeQuery.range(offset, offset + limit - 1)

  const { data: nodes, error: nodesError, count } = await nodeQuery

  if (nodesError) {
    return NextResponse.json(
      { error: 'Failed to fetch nodes' },
      { status: 500 }
    )
  }

  const total = count ?? 0
  const filteredNodes = applyPropertyFiltering((nodes || []) as ApiNode[], sharingRules as SharingRule[])

  return NextResponse.json({
    data: { ...(categories ? { categories } : {}), nodes: filteredNodes },
    pagination: { page, limit, total, has_more: offset + limit < total },
    scope,
    user_id: user.id,
  })
}
