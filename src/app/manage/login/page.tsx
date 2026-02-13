'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function ManageLoginPage() {
  const router = useRouter()
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [errorType, setErrorType] = useState<LoginErrorType>(null)

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
        return
      }
      setChecking(false)
    }
    checkAuth()
  }, [router])

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
      // Always redirect to dashboard for manage login
      router.push('/dashboard')
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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-secondary))' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'linear-gradient(135deg, var(--centra-accent), var(--centra-primary))' }}
        />
      </div>

      <div className="card-elevated max-w-md w-full relative z-10 opacity-0 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <Link href="/" className="inline-block mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto"
              style={{
                background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-primary-dark))',
                boxShadow: '0 0 30px -8px var(--centra-primary)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="16" cy="16" r="5" fill="white"/>
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-bold gradient-text mb-1">Centra 管理画面</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>管理ダッシュボードにログイン</p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            className="mb-4 p-4 rounded-lg text-sm"
            style={{
              background: errorType === 'emailNotConfirmed' ? 'var(--warning-bg)' : 'var(--error-bg)',
              border: errorType === 'emailNotConfirmed' ? '1px solid var(--warning-border)' : '1px solid var(--error-bg-strong)',
              color: errorType === 'emailNotConfirmed' ? 'var(--warning)' : 'var(--error)'
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
                        href="/signup"
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
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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
              <Link href="/forgot-password" className="text-sm hover:underline" style={{ color: 'var(--centra-primary)' }}>
                {t.login.forgotPassword}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 mt-2"
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

        {/* Sign up link */}
        <div className="mt-6 text-center">
          <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{t.login.noAccount}</span>
          {' '}
          <Link href="/signup" className="text-sm font-medium hover:underline" style={{ color: 'var(--centra-primary)' }}>
            {t.login.signupLink}
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-center mt-6" style={{ color: 'var(--foreground-muted)' }}>
          {t.login.footer}
        </p>
      </div>
    </div>
  )
}
