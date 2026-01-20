import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ConsentContent, ConsentError } from './consent-content'

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ authorization_id?: string }>
}) {
  const { authorization_id: authorizationId } = await searchParams

  console.log('[Consent] Page loaded with authorization_id:', authorizationId)

  if (!authorizationId) {
    return <ConsentError />
  }

  let user = null
  let isSignupFlow = false
  let appCallbackUrl: string | null = null

  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          // In Server Components, cookies are read-only
          setAll: () => {},
        },
      }
    )

    // Get authorization details to check state parameter for signup intent
    // Use direct REST API call with service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    console.log('[Consent] Environment check - serviceRoleKey exists:', !!serviceRoleKey, 'length:', serviceRoleKey?.length || 0)
    console.log('[Consent] Environment check - supabaseUrl:', supabaseUrl)

    if (serviceRoleKey && supabaseUrl) {
      try {
        // Call the GoTrue REST API directly with service role key
        const authApiUrl = `${supabaseUrl}/auth/v1/oauth/authorizations/${authorizationId}`
        console.log('[Consent] Calling REST API:', authApiUrl)

        const response = await fetch(authApiUrl, {
          method: 'GET',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('[Consent] REST API response status:', response.status)
        console.log('[Consent] REST API response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())))

        const responseText = await response.text()
        console.log('[Consent] REST API raw response:', responseText.substring(0, 500))

        if (response.ok) {
          try {
            const authDetails = JSON.parse(responseText)
            console.log('[Consent] REST API parsed result keys:', Object.keys(authDetails))
            console.log('[Consent] REST API full result:', JSON.stringify(authDetails))

            if (authDetails?.state) {
              console.log('[Consent] State from authorization:', authDetails.state)
              if (authDetails.state.startsWith('signup_')) {
                isSignupFlow = true
                console.log('[Consent] Detected signup flow from state prefix')
              }
            } else {
              console.log('[Consent] No state field in response')
            }

            // Extract redirect_uri for native app deep linking
            if (authDetails?.redirect_uri) {
              const redirectUri = authDetails.redirect_uri
              console.log('[Consent] Redirect URI from authorization:', redirectUri)
              // Check if it's a native app scheme (not http/https)
              if (redirectUri && !redirectUri.startsWith('http://') && !redirectUri.startsWith('https://')) {
                appCallbackUrl = redirectUri
                console.log('[Consent] Detected native app callback:', appCallbackUrl)
              }
            }
          } catch (parseErr) {
            console.error('[Consent] Failed to parse JSON response:', parseErr)
          }
        } else {
          console.error('[Consent] REST API error:', response.status, responseText)
        }
      } catch (authDetailsErr) {
        console.error('[Consent] Exception getting authorization details:', authDetailsErr)
      }
    } else {
      console.log('[Consent] Missing service role key or Supabase URL - serviceRoleKey:', !!serviceRoleKey, 'supabaseUrl:', !!supabaseUrl)
    }

    // Check if user is authenticated
    const { data } = await supabase.auth.getUser()
    user = data.user
    console.log('[Consent] User authenticated:', !!user, user?.email)
  } catch (error) {
    console.error('[Consent] Page error:', error)
    return <ConsentError message={error instanceof Error ? error.message : 'Unknown error'} />
  }

  if (!user) {
    // Redirect to login or signup based on state parameter prefix
    const authPage = isSignupFlow ? '/signup' : '/login'
    console.log('[Consent] Redirecting to:', authPage, 'isSignupFlow:', isSignupFlow, 'appCallbackUrl:', appCallbackUrl)

    // Build redirect URL with app_callback if available
    let redirectUrl = `${authPage}?redirect=${encodeURIComponent(`/oauth/consent?authorization_id=${authorizationId}`)}`
    if (appCallbackUrl) {
      redirectUrl += `&app_callback=${encodeURIComponent(appCallbackUrl)}`
    }
    redirect(redirectUrl)
  }

  // Pass user email for display and switch account functionality
  return (
    <ConsentContent
      authorizationId={authorizationId}
      userEmail={user.email || undefined}
      userName={user.user_metadata?.display_name || user.user_metadata?.name || undefined}
    />
  )
}
