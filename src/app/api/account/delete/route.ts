import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Get the current user's session
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Deleting user:', user.id)

    // Create admin client with service role key to delete the user
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Delete user's related data first (if any)
    // Delete from legacy tables
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.log('Profile delete error (may not exist):', profileError.message)
    }

    const { error: legacyCategoryError } = await supabaseAdmin
      .from('user_categories')
      .delete()
      .eq('user_id', user.id)

    if (legacyCategoryError) {
      console.log('Legacy category delete error (may not exist):', legacyCategoryError.message)
    }

    // Delete from graph tables (order matters: FK dependencies)
    const { error: edgesError } = await supabaseAdmin
      .from('edges')
      .delete()
      .eq('user_id', user.id)

    if (edgesError) {
      console.log('Edges delete error:', edgesError.message)
    }

    const { error: nodesError } = await supabaseAdmin
      .from('nodes')
      .delete()
      .eq('user_id', user.id)

    if (nodesError) {
      console.log('Nodes delete error:', nodesError.message)
    }

    const { error: sharingRulesError } = await supabaseAdmin
      .from('sharing_rules')
      .delete()
      .eq('user_id', user.id)

    if (sharingRulesError) {
      console.log('Sharing rules delete error:', sharingRulesError.message)
    }

    const { error: schemasError } = await supabaseAdmin
      .from('node_type_schemas')
      .delete()
      .eq('user_id', user.id)

    if (schemasError) {
      console.log('Node type schemas delete error:', schemasError.message)
    }

    const { error: categoriesError } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('user_id', user.id)

    if (categoriesError) {
      console.log('Categories delete error:', categoriesError.message)
    }

    // Delete the user from auth
    console.log('Attempting to delete user from auth...')
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError.message, deleteError)
      return NextResponse.json(
        { error: `Failed to delete account: ${deleteError.message}` },
        { status: 500 }
      )
    }

    console.log('User deleted successfully')

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
