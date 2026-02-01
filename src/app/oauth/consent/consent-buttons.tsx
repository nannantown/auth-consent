'use client'

// Version: 2026-02-01-v4 - Fix: Use server actions for OAuth authorization
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { approveAuthorizationAction, denyAuthorizationAction } from './actions'
import type { OAuthParams } from './consent-content'

interface ConsentButtonsProps {
  authorizationId: string
  appCallbackUrl?: string
  oauthParams?: OAuthParams
}

export function ConsentButtons({ authorizationId, appCallbackUrl, oauthParams: _oauthParams }: ConsentButtonsProps) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<'session_expired' | 'authorization_expired' | 'unknown' | null>(null)

  // Debug log on mount
  console.log('[ConsentButtons] Rendered with:', { authorizationId, appCallbackUrl, actionError })

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

  const handleRestartFlow = () => {
    // Redirect to login page within the popup (keeps popup open)
    const loginUrl = new URL('/login', window.location.origin)
    loginUrl.searchParams.set('redirect', `/oauth/consent?authorization_id=${authorizationId}`)
    if (appCallbackUrl) {
      loginUrl.searchParams.set('app_callback', appCallbackUrl)
    }
    window.location.href = loginUrl.toString()
  }

  async function handleApprove() {
    setLoading(true)
    setActionError(null)
    setErrorType(null)

    try {
      console.log('[ConsentButtons] Calling approveAuthorizationAction...')
      const result = await approveAuthorizationAction(authorizationId)
      console.log('[ConsentButtons] approveAuthorizationAction result:', result)

      if (!result.success) {
        setActionError(result.error || 'Authorization failed')
        setErrorType(result.errorType || 'unknown')
        setLoading(false)
        return
      }

      if (result.redirectUrl) {
        console.log('[ConsentButtons] Redirecting to:', result.redirectUrl)
        window.location.href = result.redirectUrl
      } else {
        console.error('[ConsentButtons] No redirect_url in response')
        setActionError(t.consent.noRedirectUrl)
        setErrorType('unknown')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('[ConsentButtons] handleApprove exception:', err)
      setActionError(err.message)
      setErrorType('unknown')
      setLoading(false)
    }
  }

  async function handleDeny() {
    setLoading(true)
    setActionError(null)
    setErrorType(null)

    try {
      console.log('[ConsentButtons] Calling denyAuthorizationAction...')
      const result = await denyAuthorizationAction(authorizationId)
      console.log('[ConsentButtons] denyAuthorizationAction result:', result)

      if (!result.success) {
        // On deny failure, redirect back to app with error
        handleBackToApp()
        return
      }

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl
      } else {
        handleBackToApp()
      }
    } catch (err: any) {
      console.error('[ConsentButtons] handleDeny exception:', err)
      handleBackToApp()
    }
  }

  // Check if error is unrecoverable (session expired or authorization expired)
  const isUnrecoverableError = errorType === 'session_expired' ||
    errorType === 'authorization_expired' ||
    (actionError && (
      actionError.toLowerCase().includes('cannot be processed') ||
      actionError.toLowerCase().includes('expired') ||
      actionError.toLowerCase().includes('invalid') ||
      actionError.toLowerCase().includes('not found')
    ))

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
