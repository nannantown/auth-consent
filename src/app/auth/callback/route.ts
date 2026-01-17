import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const next = searchParams.get('next') ?? '/'
  const type = searchParams.get('type') as EmailOtpType | null
  const appCallback = searchParams.get('app_callback')

  const supabase = await createServerSupabaseClient()

  // Handle token_hash (email verification links)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type,
    })

    if (!error) {
      // If this is a password recovery, redirect to reset password page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password?verified=true`)
      }

      // If this is a signup confirmation, redirect to signup complete page
      if (type === 'signup') {
        if (appCallback) {
          return NextResponse.redirect(
            `${origin}/signup-complete?app_callback=${encodeURIComponent(appCallback)}`
          )
        }
        return NextResponse.redirect(`${origin}/signup-complete`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }

    // Return error page
    return NextResponse.redirect(`${origin}/auth/error?error=${error.message}`)
  }

  // Handle code (OAuth/PKCE flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If this is a password recovery, redirect to reset password page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password?verified=true`)
      }

      // If this is a signup confirmation, redirect to signup complete page
      if (type === 'signup') {
        if (appCallback) {
          return NextResponse.redirect(
            `${origin}/signup-complete?app_callback=${encodeURIComponent(appCallback)}`
          )
        }
        return NextResponse.redirect(`${origin}/signup-complete`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Check if there's already a valid session (post-verification redirect from Supabase)
  // This happens when Supabase verifies the email and redirects without code/token_hash
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    // User has a valid session - this is likely a post-verification redirect
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/reset-password?verified=true`)
    }

    if (type === 'signup') {
      if (appCallback) {
        return NextResponse.redirect(
          `${origin}/signup-complete?app_callback=${encodeURIComponent(appCallback)}`
        )
      }
      return NextResponse.redirect(`${origin}/signup-complete`)
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  // No valid parameters and no session - show appropriate error
  if (type === 'signup') {
    return NextResponse.redirect(`${origin}/auth/error?error=signup_link_invalid`)
  }

  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password?error=invalid_link`)
  }

  // Default error
  return NextResponse.redirect(`${origin}/auth/error?error=invalid_callback`)
}
