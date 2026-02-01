'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type AuthorizationResult = {
  success: boolean
  redirectUrl?: string
  error?: string
  errorType?: 'session_expired' | 'authorization_expired' | 'unknown'
}

export async function approveAuthorizationAction(
  authorizationId: string
): Promise<AuthorizationResult> {
  if (!authorizationId) {
    return { success: false, error: 'Missing authorization_id', errorType: 'unknown' }
  }

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
  console.log('[approveAuthorizationAction] Current user:', user?.email)
  console.log('[approveAuthorizationAction] Approving authorization:', authorizationId)

  if (!user) {
    return {
      success: false,
      error: 'Session expired. Please log in again.',
      errorType: 'session_expired'
    }
  }

  const { data, error } = await (supabase.auth as any).oauth.approveAuthorization(
    authorizationId,
    { skipBrowserRedirect: true }
  )

  console.log('[approveAuthorizationAction] Approve result:', { data, error })

  if (error) {
    console.error('[approveAuthorizationAction] Approve error:', error)
    const errorMessage = error.message || 'Authorization failed'
    const isExpired = errorMessage.toLowerCase().includes('expired') ||
                      errorMessage.toLowerCase().includes('not found') ||
                      errorMessage.toLowerCase().includes('invalid')
    return {
      success: false,
      error: errorMessage,
      errorType: isExpired ? 'authorization_expired' : 'unknown'
    }
  }

  if (data?.redirect_url) {
    return { success: true, redirectUrl: data.redirect_url }
  }

  return { success: false, error: 'No redirect URL returned', errorType: 'unknown' }
}

export async function denyAuthorizationAction(
  authorizationId: string
): Promise<AuthorizationResult> {
  if (!authorizationId) {
    return { success: false, error: 'Missing authorization_id', errorType: 'unknown' }
  }

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
  console.log('[denyAuthorizationAction] Current user:', user?.email)
  console.log('[denyAuthorizationAction] Denying authorization:', authorizationId)

  if (!user) {
    return {
      success: false,
      error: 'Session expired',
      errorType: 'session_expired'
    }
  }

  const { data, error } = await (supabase.auth as any).oauth.denyAuthorization(
    authorizationId,
    { skipBrowserRedirect: true }
  )

  console.log('[denyAuthorizationAction] Deny result:', { data, error })

  if (error) {
    console.error('[denyAuthorizationAction] Deny error:', error)
    const errorMessage = error.message || 'Deny failed'
    const isExpired = errorMessage.toLowerCase().includes('expired') ||
                      errorMessage.toLowerCase().includes('not found') ||
                      errorMessage.toLowerCase().includes('invalid')
    return {
      success: false,
      error: errorMessage,
      errorType: isExpired ? 'authorization_expired' : 'unknown'
    }
  }

  if (data?.redirect_url) {
    return { success: true, redirectUrl: data.redirect_url }
  }

  return { success: false, error: 'No redirect URL returned', errorType: 'unknown' }
}
