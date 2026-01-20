import { createClient } from './supabase'
import type {
  Product,
  ProductInput,
  RoadmapItem,
  RoadmapItemInput,
  ProductKPI,
  ProductKPIInput,
  ProductWithDetails,
} from '@/types/product'

// ============ Products ============

export async function getProducts(userId: string): Promise<Product[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

export async function getProduct(productId: string): Promise<Product | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}

export async function getProductWithDetails(productId: string): Promise<ProductWithDetails | null> {
  const supabase = createClient()

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (productError) {
    console.error('Error fetching product:', productError)
    return null
  }

  const [roadmapResult, kpisResult] = await Promise.all([
    supabase
      .from('product_roadmap_items')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true }),
    supabase
      .from('product_kpis')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false }),
  ])

  return {
    ...product,
    roadmap_items: roadmapResult.data || [],
    kpis: kpisResult.data || [],
  }
}

export async function createProduct(
  userId: string,
  input: ProductInput
): Promise<Product | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .insert({
      user_id: userId,
      ...input,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return null
  }

  return data
}

export async function updateProduct(
  productId: string,
  input: Partial<ProductInput>
): Promise<Product | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return null
  }

  return data
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    console.error('Error deleting product:', error)
    return false
  }

  return true
}

// ============ Roadmap Items ============

export async function getRoadmapItems(productId: string): Promise<RoadmapItem[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('product_roadmap_items')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching roadmap items:', error)
    return []
  }

  return data || []
}

export async function createRoadmapItem(
  userId: string,
  input: RoadmapItemInput
): Promise<RoadmapItem | null> {
  const supabase = createClient()

  // Get max display_order
  const { data: existing } = await supabase
    .from('product_roadmap_items')
    .select('display_order')
    .eq('product_id', input.product_id)
    .order('display_order', { ascending: false })
    .limit(1)

  const maxOrder = existing?.[0]?.display_order ?? -1

  const { data, error } = await supabase
    .from('product_roadmap_items')
    .insert({
      user_id: userId,
      ...input,
      display_order: maxOrder + 1,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating roadmap item:', error)
    return null
  }

  return data
}

export async function updateRoadmapItem(
  itemId: string,
  input: Partial<RoadmapItemInput>
): Promise<RoadmapItem | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('product_roadmap_items')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
      ...(input.status === 'completed' ? { completed_date: new Date().toISOString().split('T')[0] } : {}),
    })
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    console.error('Error updating roadmap item:', error)
    return null
  }

  return data
}

export async function deleteRoadmapItem(itemId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('product_roadmap_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    console.error('Error deleting roadmap item:', error)
    return false
  }

  return true
}

// ============ KPIs ============

export async function getProductKPIs(productId: string): Promise<ProductKPI[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('product_kpis')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching KPIs:', error)
    return []
  }

  return data || []
}

export async function createProductKPI(
  userId: string,
  input: ProductKPIInput
): Promise<ProductKPI | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('product_kpis')
    .insert({
      user_id: userId,
      ...input,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating KPI:', error)
    return null
  }

  return data
}

export async function updateProductKPI(
  kpiId: string,
  input: Partial<ProductKPIInput>
): Promise<ProductKPI | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('product_kpis')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    })
    .eq('id', kpiId)
    .select()
    .single()

  if (error) {
    console.error('Error updating KPI:', error)
    return null
  }

  return data
}

export async function deleteProductKPI(kpiId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('product_kpis')
    .delete()
    .eq('id', kpiId)

  if (error) {
    console.error('Error deleting KPI:', error)
    return false
  }

  return true
}
