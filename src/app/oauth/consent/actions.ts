'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function approveAuthorization(formData: FormData) {
  const authorizationId = formData.get('authorization_id') as string

  if (!authorizationId) {
    return { error: 'Missing authorization_id' }
  }

  // Using the documented async pattern for cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const cookieStore = await cookies()
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Current user:', user?.email)
  console.log('Approving authorization:', authorizationId)

  const { data, error } = await (supabase.auth as any).oauth.approveAuthorization(authorizationId)

  console.log('Approve result:', { data, error })

  if (error) {
    console.error('Approve error:', error)
    return { error: error.message }
  }

  if (data?.redirect_to) {
    redirect(data.redirect_to)
  }

  return { error: 'No redirect URL returned' }
}

export async function denyAuthorization(formData: FormData) {
  const authorizationId = formData.get('authorization_id') as string

  if (!authorizationId) {
    return { error: 'Missing authorization_id' }
  }

  // Using the documented async pattern for cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const cookieStore = await cookies()
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await (supabase.auth as any).oauth.denyAuthorization(authorizationId)

  if (error) {
    console.error('Deny error:', error)
    return { error: error.message }
  }

  if (data?.redirect_to) {
    redirect(data.redirect_to)
  }

  return { error: 'No redirect URL returned' }
}
