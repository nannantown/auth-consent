'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { addRecentAccount } from '@/lib/account-history'

type LoginErrorType = 'invalidCredentials' | 'emailNotConfirmed' | 'tooManyRequests' | 'userNotFound' | 'invalidEmail' | 'networkError' | 'unknown' | null

function getLoginErrorType(errorMessage: string): LoginErrorType {
  const message = errorMessage.toLowerCase()

  if (message.includes('invalid login credentials') || message.includes('invalid password')) {
    return 'invalidCredentials'
  }
  if (message.includes('email not confirmed') || message.includes('not confirmed')) {
    return 'emailNotConfirmed'
  }
  if (message.includes('too many requests') || message.includes('rate limit')) {
    return 'tooManyRequests'
  }
  if (message.includes('user not found') || message.includes('no user found')) {
    return 'userNotFound'
  }
  if (message.includes('invalid email')) {
    return 'invalidEmail'
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'networkError'
  }

  return 'unknown'
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirect = searchParams.get('redirect') || '/'
  const emailHint = searchParams.get('email_hint')
  const appCallback = searchParams.get('app_callback')
  const emailVerified = searchParams.get('email_verified') === 'true'
  const forceLogout = searchParams.get('force_logout') === 'true'
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorType, setErrorType] = useState<LoginErrorType>(null)

  useEffect(() => {
    if (emailHint) {
      setEmail(emailHint)
    }
  }, [emailHint])

  // Clear existing session when force_logout is true (OAuth flow)
  useEffect(() => {
    if (forceLogout) {
      const supabase = createClient()
      supabase.auth.signOut()
    }
  }, [forceLogout])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorType(null)

    const supabase = createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setErrorType(getLoginErrorType(signInError.message))
      setLoading(false)
    } else {
      const userName = data.user?.user_metadata?.display_name || data.user?.user_metadata?.name
      addRecentAccount(email, userName)

      // Always follow redirect URL first (e.g., for OAuth consent flow)
      // The consent page will handle the final redirect to the app
      if (redirect && redirect !== '/') {
        router.push(redirect)
      } else if (appCallback) {
        // Only go to login-complete if there's no redirect (direct login, not OAuth flow)
        router.push(`/login-complete?app_callback=${encodeURIComponent(appCallback)}`)
      } else {
        router.push('/')
      }
    }
  }

  // Get error messages based on error type
  const getErrorMessage = (): { main: string; detail: string } | null => {
    if (!errorType) return null

    switch (errorType) {
      case 'invalidCredentials':
        return { main: t.errors.invalidCredentials, detail: t.errors.invalidCredentialsDetail }
      case 'emailNotConfirmed':
        return { main: t.errors.emailNotConfirmed, detail: t.errors.emailNotConfirmedDetail }
      case 'tooManyRequests':
        return { main: t.errors.tooManyRequests, detail: t.errors.tooManyRequestsDetail }
      case 'userNotFound':
        return { main: t.errors.userNotFound, detail: t.errors.userNotFoundDetail }
      case 'invalidEmail':
        return { main: t.errors.invalidEmail, detail: '' }
      case 'networkError':
        return { main: t.errors.networkError, detail: t.errors.networkErrorDetail }
      default:
        return { main: t.errors.unknownError, detail: t.errors.unknownErrorDetail }
    }
  }

  const errorMessage = getErrorMessage()
  const showSignupLink = errorType === 'invalidCredentials' || errorType === 'userNotFound'

  return (
    <>
      {/* Email Verified Success Message */}
      {emailVerified && (
        <div
          className="mb-4 p-4 rounded-lg text-sm"
          style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#22c55e'
          }}
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">{t.login.emailVerifiedTitle}</p>
              <p className="mt-1 text-sm opacity-90">{t.login.emailVerifiedMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          className="mb-4 p-4 rounded-lg text-sm"
          style={{
            background: errorType === 'emailNotConfirmed' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: errorType === 'emailNotConfirmed' ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
            color: errorType === 'emailNotConfirmed' ? '#f59e0b' : '#ef4444'
          }}
        >
          <div className="flex items-start gap-3">
            {errorType === 'emailNotConfirmed' ? (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div>
              <p className="font-medium">{errorMessage.main}</p>
              {errorMessage.detail && (
                <p className="mt-1 text-sm opacity-90">
                  {errorMessage.detail}
                  {showSignupLink && (
                    <Link
                      href={`/signup${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}${appCallback ? `${redirect !== '/' ? '&' : '?'}app_callback=${encodeURIComponent(appCallback)}` : ''}`}
                      className="underline font-medium ml-1 hover:opacity-80"
                    >
                      {t.login.signupLink}
                    </Link>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="label block mb-2">
            {t.email}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            placeholder={t.login.emailPlaceholder}
          />
        </div>

        <div>
          <label htmlFor="password" className="label block mb-2">
            {t.password}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
            placeholder={t.login.passwordPlaceholder}
          />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-xs hover:underline" style={{ color: 'var(--text-secondary)' }}>
              {t.login.forgotPassword}
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.login.loading}
            </span>
          ) : (
            t.login.button
          )}
        </button>
      </form>
    </>
  )
}
