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

      // If this is a signup confirmation, redirect appropriately
      if (type === 'signup') {
        // app_callback がある場合は「メールアドレスが認証されました」画面へ（アプリに戻るボタン付き）
        if (appCallback) {
          return NextResponse.redirect(
            `${origin}/signup-complete?app_callback=${encodeURIComponent(appCallback)}`
          )
        }
        // next パラメータがある場合（OAuthフローなど）はそこへリダイレクト
        if (next && next !== '/') {
          return NextResponse.redirect(`${origin}${next}`)
        }
        // それ以外はログイン画面へ（メール認証完了メッセージ付き）
        return NextResponse.redirect(`${origin}/login?email_verified=true`)
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

      // If this is a signup confirmation, redirect appropriately
      if (type === 'signup') {
        // app_callback がある場合は「メールアドレスが認証されました」画面へ（アプリに戻るボタン付き）
        if (appCallback) {
          return NextResponse.redirect(
            `${origin}/signup-complete?app_callback=${encodeURIComponent(appCallback)}`
          )
        }
        // next パラメータがある場合（OAuthフローなど）はそこへリダイレクト
        if (next && next !== '/') {
          return NextResponse.redirect(`${origin}${next}`)
        }
        // それ以外はログイン画面へ（メール認証完了メッセージ付き）
        return NextResponse.redirect(`${origin}/login?email_verified=true`)
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
      // app_callback がある場合は「メールアドレスが認証されました」画面へ（アプリに戻るボタン付き）
      if (appCallback) {
        return NextResponse.redirect(
          `${origin}/signup-complete?app_callback=${encodeURIComponent(appCallback)}`
        )
      }
      // next パラメータがある場合（OAuthフローなど）はそこへリダイレクト
      if (next && next !== '/') {
        return NextResponse.redirect(`${origin}${next}`)
      }
      // それ以外はログイン画面へ（メール認証完了メッセージ付き）
      return NextResponse.redirect(`${origin}/login?email_verified=true`)
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  // No valid parameters and no session - handle signup case specially
  // When signup verification succeeds in a different browser (Safari) than where signup started (in-app browser),
  // PKCE fails because code_verifier is stored in the original browser.
  // In this case, the email IS verified.
  if (type === 'signup') {
    // app_callback がある場合は「認証されました」画面へ（アプリに戻るボタン付き）
    // ログインフォームは表示せず、アプリに戻すようにする
    if (appCallback) {
      return NextResponse.redirect(
        `${origin}/signup-complete?app_callback=${encodeURIComponent(appCallback)}`
      )
    }
    // app_callback がない場合はログイン画面へ
    const loginUrl = new URL(`${origin}/login`)
    loginUrl.searchParams.set('email_verified', 'true')
    if (next && next !== '/') {
      loginUrl.searchParams.set('redirect', next)
    }
    return NextResponse.redirect(loginUrl.toString())
  }

  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password?error=invalid_link`)
  }

  // Default error
  return NextResponse.redirect(`${origin}/auth/error?error=invalid_callback`)
}
