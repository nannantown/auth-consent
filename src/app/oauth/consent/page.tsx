import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ConsentButtons } from './consent-buttons'

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ authorization_id?: string }>
}) {
  const { authorization_id: authorizationId } = await searchParams

  if (!authorizationId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-red-600 text-center">
            <ErrorIcon />
            <h2 className="text-lg font-semibold mb-2">エラー</h2>
            <p className="text-gray-600">authorization_id が見つかりません</p>
          </div>
        </div>
      </div>
    )
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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login, preserving authorization_id
    redirect(`/login?redirect=/oauth/consent?authorization_id=${authorizationId}`)
  }

  // Don't call getAuthorizationDetails - go directly to approve/deny
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldIcon />
          </div>
          <h1 className="text-xl font-bold text-gray-900">アクセス許可のリクエスト</h1>
        </div>

        {/* Client Info */}
        <div className="mb-6">
          <p className="text-gray-600 text-center">
            アプリがあなたのアカウントへのアクセスを求めています
          </p>
        </div>

        {/* Client-side consent buttons */}
        <ConsentButtons authorizationId={authorizationId} />

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          許可すると、アプリにリダイレクトされます
        </p>
      </div>
    </div>
  )
}

function ErrorIcon() {
  return (
    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}
