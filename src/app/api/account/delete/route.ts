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

    console.log('Deleting user data:', user.id)

    // Create admin client with service role key to delete user data
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

    // Delete user's profile data (keep auth account)
    // Delete from profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.log('Profile delete error (may not exist):', profileError.message)
    }

    // Delete from sharing_settings table
    const { error: sharingError } = await supabaseAdmin
      .from('sharing_settings')
      .delete()
      .eq('user_id', user.id)

    if (sharingError) {
      console.log('Sharing settings delete error (may not exist):', sharingError.message)
    }

    // Delete from user_categories table
    const { error: categoryError } = await supabaseAdmin
      .from('user_categories')
      .delete()
      .eq('user_id', user.id)

    if (categoryError) {
      console.log('Category delete error (may not exist):', categoryError.message)
    }

    console.log('User data deleted successfully (auth account preserved)')

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account data deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
