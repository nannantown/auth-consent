import { createClient } from './supabase'
import type { UserCategory } from '@/types/category'

// Client-side functions only
export async function getUserCategories(userId: string): Promise<UserCategory[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_categories')
    .select('*')
    .eq('user_id', userId)
    .eq('is_enabled', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching user categories:', error)
    return []
  }

  return data || []
}

export async function addUserCategory(
  userId: string,
  categorySlug: string
): Promise<UserCategory | null> {
  const supabase = createClient()

  // Get current max display_order
  const { data: existing } = await supabase
    .from('user_categories')
    .select('display_order')
    .eq('user_id', userId)
    .order('display_order', { ascending: false })
    .limit(1)

  const maxOrder = existing?.[0]?.display_order ?? -1

  const { data, error } = await supabase
    .from('user_categories')
    .upsert({
      user_id: userId,
      category_slug: categorySlug,
      display_order: maxOrder + 1,
      is_enabled: true,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,category_slug',
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding user category:', error)
    return null
  }

  return data
}

export async function removeUserCategory(
  userId: string,
  categorySlug: string
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('user_categories')
    .update({
      is_enabled: false,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('category_slug', categorySlug)

  if (error) {
    console.error('Error removing user category:', error)
    return false
  }

  return true
}

export async function reorderUserCategories(
  userId: string,
  orderedSlugs: string[]
): Promise<boolean> {
  const supabase = createClient()

  // Update each category's display_order
  const updates = orderedSlugs.map((slug, index) =>
    supabase
      .from('user_categories')
      .update({
        display_order: index,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('category_slug', slug)
  )

  const results = await Promise.all(updates)
  const hasError = results.some(r => r.error)

  if (hasError) {
    console.error('Error reordering categories')
    return false
  }

  return true
}
