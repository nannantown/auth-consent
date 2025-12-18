'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'

interface ConsentButtonsProps {
  authorizationId: string
}

export function ConsentButtons({ authorizationId }: ConsentButtonsProps) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [fatalError, setFatalError] = useState<string | null>(null)  // Cannot process at all
  const [actionError, setActionError] = useState<string | null>(null)  // Error during approve/deny
  const [authDetails, setAuthDetails] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch authorization details on mount
  useEffect(() => {
    async function fetchDetails() {
      setInitialLoading(true)
      setFatalError(null)
      try {
        const result = await (supabase.auth as any).oauth.getAuthorizationDetails(authorizationId)

        // Extract data and error from result
        const data = result?.data
        const error = result?.error

        // Check for any kind of error
        if (error) {
          setFatalError(error.message || 'Authorization request cannot be processed')
          return
        }

        // Check if data itself contains an error
        if (data?.error) {
          const errMsg = typeof data.error === 'string' ? data.error : data.error.message || 'Authorization request cannot be processed'
          setFatalError(errMsg)
          return
        }

        // No data means cannot process
        if (!data) {
          setFatalError('Authorization details not found')
          return
        }

        // Success - we have valid auth details
        setAuthDetails(data)
      } catch (err: any) {
        setFatalError(err.message || 'An error occurred')
      } finally {
        setInitialLoading(false)
      }
    }
    fetchDetails()
  }, [authorizationId])

  // Redirect back to Murder Mystery app with error
  const handleBackToApp = () => {
    window.location.href = 'io.supabase.murderrpg://auth/callback?error=access_denied&error_description=authorization_cancelled'
  }

  async function handleApprove() {
    setLoading(true)
    setActionError(null)

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
        setActionError(approveError.message)
        setLoading(false)
        return
      }

      if (data?.redirect_to) {
        window.location.href = data.redirect_to
      } else {
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
        // Even if denial fails (e.g., expired), redirect back to app
        // The result is the same - user won't be logged in
        handleBackToApp()
        return
      }

      if (data?.redirect_to) {
        window.location.href = data.redirect_to
      } else {
        // No redirect URL, just go back to app
        handleBackToApp()
      }
    } catch (err: any) {
      // On any error, redirect back to app
      handleBackToApp()
    }
  }

  // Show loading spinner while fetching authorization details
  if (initialLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // FATAL ERROR: Authorization cannot be processed at all - show only back to app button
  // Also check if authDetails is missing as a fallback
  if (fatalError || !authDetails) {
    return (
      <div>
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          {t.consent.cannotProcess}
        </div>
        <button
          type="button"
          onClick={handleBackToApp}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t.consent.backToApp}
        </button>
      </div>
    )
  }

  // Check if actionError indicates authorization cannot be processed
  // In this case, show back to app button instead of approve/deny
  const isUnrecoverableError = actionError && (
    actionError.toLowerCase().includes('cannot be processed') ||
    actionError.toLowerCase().includes('expired') ||
    actionError.toLowerCase().includes('invalid')
  )

  if (isUnrecoverableError) {
    return (
      <div>
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          {t.consent.cannotProcess}
        </div>
        <button
          type="button"
          onClick={handleBackToApp}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t.consent.backToApp}
        </button>
      </div>
    )
  }

  // Normal state: show approve/deny buttons (only when authDetails exists)
  return (
    <div>
      {actionError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          {actionError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDeny}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {t.consent.deny}
        </button>
        <button
          type="button"
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? t.consent.loading : t.consent.allow}
        </button>
      </div>
    </div>
  )
}
