'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface AuthorizationDetails {
  client: {
    name: string
    id: string
  }
  redirect_uri: string
  scopes: string[]
}

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  openid: 'OpenID Connect認証',
  email: 'メールアドレスの読み取り',
  profile: 'プロフィール情報の読み取り',
  phone: '電話番号の読み取り',
}

export default function ConsentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const authorizationId = searchParams.get('authorization_id')

  const [authDetails, setAuthDetails] = useState<AuthorizationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    async function loadAuthDetails() {
      if (!authorizationId) {
        setError('authorization_id が見つかりません')
        setLoading(false)
        return
      }

      const supabase = createClient()

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login, preserving authorization_id
        router.push(`/login?redirect=/oauth/consent?authorization_id=${authorizationId}`)
        return
      }

      // Get authorization details
      // Note: This method may need to be adjusted based on actual Supabase OAuth API
      try {
        const { data, error: authError } = await (supabase.auth as any).oauth.getAuthorizationDetails(authorizationId)

        if (authError) {
          setError(authError.message)
        } else {
          setAuthDetails(data)
        }
      } catch (e) {
        setError('認可情報の取得に失敗しました')
      }

      setLoading(false)
    }

    loadAuthDetails()
  }, [authorizationId, router])

  async function handleApprove() {
    if (!authorizationId) return
    setProcessing(true)

    const supabase = createClient()

    try {
      const { data, error: approveError } = await (supabase.auth as any).oauth.approveAuthorization(authorizationId)

      if (approveError) {
        setError(approveError.message)
        setProcessing(false)
      } else {
        // Redirect to client app
        window.location.href = data.redirect_to
      }
    } catch (e) {
      setError('認可の承認に失敗しました')
      setProcessing(false)
    }
  }

  async function handleDeny() {
    if (!authorizationId) return
    setProcessing(true)

    const supabase = createClient()

    try {
      const { data, error: denyError } = await (supabase.auth as any).oauth.denyAuthorization(authorizationId)

      if (denyError) {
        setError(denyError.message)
        setProcessing(false)
      } else {
        // Redirect to client app with error
        window.location.href = data.redirect_to
      }
    } catch (e) {
      setError('認可の拒否に失敗しました')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-red-600 text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-lg font-semibold mb-2">エラー</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!authDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <p className="text-gray-600">認可リクエストが見つかりません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">アクセス許可のリクエスト</h1>
        </div>

        {/* Client Info */}
        <div className="mb-6">
          <p className="text-gray-600 text-center">
            <span className="font-semibold text-gray-900">{authDetails.client.name}</span>
            {' '}があなたのアカウントへのアクセスを求めています
          </p>
        </div>

        {/* Scopes */}
        {authDetails.scopes && authDetails.scopes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">このアプリがアクセスする情報:</h3>
            <ul className="space-y-2">
              {authDetails.scopes.map((scope) => (
                <li key={scope} className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {SCOPE_DESCRIPTIONS[scope] || scope}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDeny}
            disabled={processing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            拒否
          </button>
          <button
            onClick={handleApprove}
            disabled={processing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? '処理中...' : '許可する'}
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          許可すると、{authDetails.client.name} にリダイレクトされます
        </p>
      </div>
    </div>
  )
}
