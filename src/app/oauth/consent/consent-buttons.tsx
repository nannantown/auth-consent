'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'

interface ConsentButtonsProps {
  authorizationId: string
  appCallbackUrl?: string
}

export function ConsentButtons({ authorizationId, appCallbackUrl }: ConsentButtonsProps) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [fatalError, setFatalError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [authDetails, setAuthDetails] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchDetails() {
      setInitialLoading(true)
      setFatalError(null)
      try {
        const result = await (supabase.auth as any).oauth.getAuthorizationDetails(authorizationId)

        const data = result?.data
        const error = result?.error

        if (error) {
          setFatalError(error.message || 'Authorization request cannot be processed')
          return
        }

        if (data?.error) {
          const errMsg = typeof data.error === 'string' ? data.error : data.error.message || 'Authorization request cannot be processed'
          setFatalError(errMsg)
          return
        }

        if (!data) {
          setFatalError('Authorization details not found')
          return
        }

        setAuthDetails(data)
      } catch (err: any) {
        setFatalError(err.message || 'An error occurred')
      } finally {
        setInitialLoading(false)
      }
    }
    fetchDetails()
  }, [authorizationId])

  const getAppRedirectUrl = () => {
    // First try from authDetails, then fall back to prop
    const redirectUrl = authDetails?.redirect_url || authDetails?.redirect_uri || appCallbackUrl
    if (redirectUrl) {
      try {
        const url = new URL(redirectUrl)
        return `${url.protocol}//${url.host}${url.pathname}`
      } catch {
        const match = redirectUrl.match(/^([a-z][a-z0-9+.-]*:\/\/[^?#]*)/)
        if (match) return match[1]
      }
    }
    // Fallback to Open Ground if we can't determine the callback URL
    // This is a known client that uses web-based OAuth
    return 'https://open-ground.co/auth/callback'
  }

  const handleBackToApp = () => {
    const baseUrl = getAppRedirectUrl()
    if (baseUrl) {
      window.location.href = `${baseUrl}?error=access_denied&error_description=authorization_cancelled`
    } else {
      window.history.back()
    }
  }

  async function handleApprove() {
    setLoading(true)
    setActionError(null)

    try {
      const redirectUrl = authDetails?.redirect_url || authDetails?.redirect_uri
      if (redirectUrl && redirectUrl.includes('code=')) {
        window.location.href = redirectUrl
        return
      }

      const { data, error: approveError } = await (supabase.auth as any).oauth.approveAuthorization(authorizationId)

      if (approveError) {
        setActionError(approveError.message)
        setLoading(false)
        return
      }

      if (data?.redirect_url) {
        window.location.href = data.redirect_url
      } else {
        // redirect_url がない場合はエラー
        console.error('No redirect_url in approveAuthorization response')
        setActionError(t.consent.noRedirectUrl)
        setLoading(false)
      }
    } catch (err: any) {
      setActionError(err.message)
      setLoading(false)
    }
  }

  async function handleDeny() {
    setLoading(true)
    setActionError(null)

    try {
      const { data, error: denyError } = await (supabase.auth as any).oauth.denyAuthorization(authorizationId)

      if (denyError) {
        handleBackToApp()
        return
      }

      if (data?.redirect_url) {
        window.location.href = data.redirect_url
      } else {
        handleBackToApp()
      }
    } catch (err: any) {
      handleBackToApp()
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-8 h-8 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (fatalError || !authDetails) {
    // Try to redirect back to app to restart OAuth flow
    const handleRestartFlow = () => {
      const baseUrl = getAppRedirectUrl()
      if (baseUrl) {
        // Redirect with error to trigger OAuth restart
        window.location.href = `${baseUrl}?error=authorization_expired&error_description=${encodeURIComponent('Authorization request expired or invalid. Please try again.')}`
      } else {
        window.history.back()
      }
    }

    return (
      <div>
        <div
          className="mb-4 p-4 rounded-lg text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444'
          }}
        >
          {t.consent.cannotProcess}
        </div>
        <button
          type="button"
          onClick={handleRestartFlow}
          className="btn btn-primary w-full py-3 mb-2"
        >
          {t.consent.retryLogin || 'ログインをやり直す'}
        </button>
        <button
          type="button"
          onClick={handleBackToApp}
          className="btn btn-secondary w-full py-3"
        >
          {t.consent.backToApp}
        </button>
      </div>
    )
  }

  const isUnrecoverableError = actionError && (
    actionError.toLowerCase().includes('cannot be processed') ||
    actionError.toLowerCase().includes('expired') ||
    actionError.toLowerCase().includes('invalid')
  )

  if (isUnrecoverableError) {
    return (
      <div>
        <div
          className="mb-4 p-4 rounded-lg text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444'
          }}
        >
          {t.consent.cannotProcess}
        </div>
        <button
          type="button"
          onClick={handleBackToApp}
          className="btn btn-secondary w-full py-3"
        >
          {t.consent.backToApp}
        </button>
      </div>
    )
  }

  return (
    <div>
      {actionError && (
        <div
          className="mb-4 p-4 rounded-lg text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444'
          }}
        >
          {actionError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDeny}
          disabled={loading}
          className="btn btn-secondary flex-1 py-3"
        >
          {t.consent.deny}
        </button>
        <button
          type="button"
          onClick={handleApprove}
          disabled={loading}
          className="btn btn-primary flex-1 py-3"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.consent.loading}
            </span>
          ) : (
            t.consent.allow
          )}
        </button>
      </div>
    </div>
  )
}
