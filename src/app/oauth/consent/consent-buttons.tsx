'use client'

// Version: 2026-01-31-v3 - Fix: Use skipBrowserRedirect to prevent library auto-redirect
import { createBrowserClient } from '@supabase/ssr'
import { useState, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'
import type { OAuthParams } from './consent-content'

interface ConsentButtonsProps {
  authorizationId: string
  appCallbackUrl?: string
  oauthParams?: OAuthParams
}

export function ConsentButtons({ authorizationId, appCallbackUrl, oauthParams }: ConsentButtonsProps) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Debug log on mount
  console.log('[ConsentButtons] Rendered with:', { authorizationId, appCallbackUrl, actionError })

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const getAppRedirectUrl = () => {
    if (appCallbackUrl) {
      try {
        const url = new URL(appCallbackUrl)
        return `${url.protocol}//${url.host}${url.pathname}`
      } catch {
        const match = appCallbackUrl.match(/^([a-z][a-z0-9+.-]*:\/\/[^?#]*)/)
        if (match) return match[1]
      }
    }
    // Fallback to Open Ground
    return 'https://open-ground.co/auth/callback'
  }

  const handleBackToApp = () => {
    const baseUrl = getAppRedirectUrl()
    window.location.href = `${baseUrl}?error=access_denied&error_description=authorization_cancelled`
  }

  // Build Supabase authorize URL for restarting OAuth flow within Centra
  const buildAuthorizeUrl = () => {
    if (!oauthParams) return null

    const authorizeUrl = new URL(
      '/auth/v1/oauth/authorize',
      process.env.NEXT_PUBLIC_SUPABASE_URL
    )
    authorizeUrl.searchParams.set('client_id', oauthParams.clientId)
    authorizeUrl.searchParams.set('redirect_uri', oauthParams.redirectUri)
    authorizeUrl.searchParams.set('response_type', oauthParams.responseType)
    authorizeUrl.searchParams.set('scope', oauthParams.scope)
    if (oauthParams.codeChallenge) {
      authorizeUrl.searchParams.set('code_challenge', oauthParams.codeChallenge)
    }
    if (oauthParams.codeChallengeMethod) {
      authorizeUrl.searchParams.set('code_challenge_method', oauthParams.codeChallengeMethod)
    }
    authorizeUrl.searchParams.set('prompt', 'consent')

    return authorizeUrl.toString()
  }

  const handleRestartFlow = () => {
    // Try to restart OAuth flow within Centra (keeps popup open)
    const authorizeUrl = buildAuthorizeUrl()
    if (authorizeUrl) {
      window.location.href = authorizeUrl
    } else {
      // Fallback: redirect to client app
      const baseUrl = getAppRedirectUrl()
      window.location.href = `${baseUrl}?error=authorization_expired&error_description=${encodeURIComponent('Please try again.')}`
    }
  }

  async function handleApprove() {
    setLoading(true)
    setActionError(null)

    try {
      // IMPORTANT: Use skipBrowserRedirect: true to prevent the library from
      // automatically calling window.location.assign() which would cause
      // the entire browser to redirect instead of just the popup
      const result = await (supabase.auth as any).oauth.approveAuthorization(
        authorizationId,
        { skipBrowserRedirect: true }
      )
      const { data, error: approveError } = result || {}

      if (approveError) {
        console.error('[ConsentButtons] approveAuthorization error:', approveError)
        setActionError(approveError.message)
        setLoading(false)
        return
      }

      if (data?.redirect_url) {
        // Manual redirect - this keeps control in our code
        window.location.href = data.redirect_url
      } else {
        console.error('[ConsentButtons] No redirect_url in response')
        setActionError(t.consent.noRedirectUrl)
        setLoading(false)
      }
    } catch (err: any) {
      console.error('[ConsentButtons] handleApprove exception:', err)
      setActionError(err.message)
      setLoading(false)
    }
  }

  async function handleDeny() {
    setLoading(true)
    setActionError(null)

    try {
      // Use skipBrowserRedirect: true for consistency with handleApprove
      const result = await (supabase.auth as any).oauth.denyAuthorization(
        authorizationId,
        { skipBrowserRedirect: true }
      )
      const { data, error: denyError } = result || {}

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

  // Check if error is unrecoverable
  const isUnrecoverableError = actionError && (
    actionError.toLowerCase().includes('cannot be processed') ||
    actionError.toLowerCase().includes('expired') ||
    actionError.toLowerCase().includes('invalid') ||
    actionError.toLowerCase().includes('not found')
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
