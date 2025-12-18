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

  if (!authorizationId) {
    return <ConsentError />
  }

  let user = null

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

    // Check if user is authenticated
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Consent page error:', error)
    return <ConsentError message={error instanceof Error ? error.message : 'Unknown error'} />
  }

  if (!user) {
    // Redirect to login, preserving authorization_id
    redirect(`/login?redirect=/oauth/consent?authorization_id=${authorizationId}`)
  }

  // Don't call getAuthorizationDetails - go directly to approve/deny
  return <ConsentContent authorizationId={authorizationId} />
}
