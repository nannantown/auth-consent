'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect } from 'react'

interface ConsentButtonsProps {
  authorizationId: string
}

export function ConsentButtons({ authorizationId }: ConsentButtonsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authDetails, setAuthDetails] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch authorization details on mount
  useEffect(() => {
    async function fetchDetails() {
      const { data, error } = await (supabase.auth as any).oauth.getAuthorizationDetails(authorizationId)
      if (data) {
        setAuthDetails(data)
      }
      if (error) {
        setError(error.message)
      }
    }
    fetchDetails()
  }, [authorizationId])

  async function handleApprove() {
    setLoading(true)
    setError(null)

    try {
      // Check if authDetails already has a redirect_url with code (auto-approved)
      const redirectUrl = authDetails?.redirect_url || authDetails?.redirect_uri
      if (redirectUrl && redirectUrl.includes('code=')) {
        window.location.href = redirectUrl
        return
      }

      // Otherwise, try to approve
      const { data, error: approveError } = await (supabase.auth as any).oauth.approveAuthorization(authorizationId)

      if (approveError) {
        setError(approveError.message)
        setLoading(false)
        return
      }

      if (data?.redirect_to) {
        window.location.href = data.redirect_to
      } else {
        setError('リダイレクトURLが取得できませんでした')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  async function handleDeny() {
    setLoading(true)
    setError(null)

    try {
      const { data, error: denyError } = await (supabase.auth as any).oauth.denyAuthorization(authorizationId)

      if (denyError) {
        setError(denyError.message)
        setLoading(false)
        return
      }

      if (data?.redirect_to) {
        window.location.href = data.redirect_to
      } else {
        setError('No redirect URL returned')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDeny}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          拒否
        </button>
        <button
          type="button"
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? '処理中...' : '許可する'}
        </button>
      </div>
    </div>
  )
}
