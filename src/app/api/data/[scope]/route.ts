import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ scope: string }> }
) {
  const { scope } = await params

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
    .filter((r: any) => r.category_id && !r.node_type && !r.node_id)
    .map((r: any) => r.category_id)

  const shareableTypeRules = sharingRules
    .filter((r: any) => r.category_id && r.node_type && !r.node_id)

  // Fetch categories based on scope
  if (scope === 'all' || scope === 'categories') {
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .in('id', shareableCategoryIds)

    if (catError) {
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    if (scope === 'categories') {
      return NextResponse.json({ data: categories, scope, user_id: user.id })
    }
  }

  // For 'all' or 'nodes' scope, fetch shareable nodes
  let nodeQuery = supabase
    .from('nodes')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)

  // Filter to only shareable categories and types
  if (shareableCategoryIds.length > 0 || shareableTypeRules.length > 0) {
    const categoryFilters = shareableCategoryIds.map(
      (id: string) => `category_id.eq.${id}`
    )
    const typeFilters = shareableTypeRules.map(
      (r: any) => `and(category_id.eq.${r.category_id},node_type.eq.${r.node_type})`
    )
    const allFilters = [...categoryFilters, ...typeFilters]

    if (allFilters.length > 0) {
      nodeQuery = nodeQuery.or(allFilters.join(','))
    }
  } else {
    // No shareable rules, return empty
    return NextResponse.json({ data: [], scope, user_id: user.id })
  }

  const { data: nodes, error: nodesError } = await nodeQuery

  if (nodesError) {
    return NextResponse.json(
      { error: 'Failed to fetch nodes' },
      { status: 500 }
    )
  }

  // For specific scope (category slug), filter further
  if (scope !== 'all' && scope !== 'nodes') {
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

    const filteredNodes = (nodes || []).filter(
      (n: any) => n.category_id === category.id
    )
    return NextResponse.json({
      data: filteredNodes,
      scope,
      user_id: user.id,
    })
  }

  return NextResponse.json({ data: nodes || [], scope, user_id: user.id })
}
