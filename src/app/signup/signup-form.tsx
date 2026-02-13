'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export function SignupForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirect = searchParams.get('redirect') || '/'
  const appCallback = searchParams.get('app_callback')
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEmailAlreadyRegistered, setIsEmailAlreadyRegistered] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError(t.errors.passwordMismatch)
      return
    }

    if (password.length < 6) {
      setError(t.errors.passwordTooShort)
      return
    }

    setLoading(true)
    setError(null)
    setIsEmailAlreadyRegistered(false)

    const supabase = createClient()

    // emailRedirectToを動的に設定
    // アプリからの登録の場合は、登録完了ページにリダイレクト
    const emailRedirectTo = appCallback
      ? `${window.location.origin}/auth/callback?type=signup&app_callback=${encodeURIComponent(appCallback)}`
      : `${window.location.origin}/auth/callback?type=signup&next=${encodeURIComponent(redirect)}`

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
        emailRedirectTo,
      },
    })

    if (signUpError) {
      // Check if the error is about email already being registered
      const errorMessage = signUpError.message.toLowerCase()
      if (
        errorMessage.includes('user already registered') ||
        errorMessage.includes('already been registered') ||
        errorMessage.includes('email already') ||
        errorMessage.includes('already exists')
      ) {
        setIsEmailAlreadyRegistered(true)
        setError(t.errors.emailAlreadyRegistered)
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // Supabase returns 200 OK with empty identities for duplicate email signups
      // This is a security feature to prevent email enumeration attacks
      setIsEmailAlreadyRegistered(true)
      setError(t.errors.emailAlreadyRegistered)
      setLoading(false)
    } else {
      // 登録成功 → 確認メール送信ページにリダイレクト
      const pendingUrl = new URL('/signup-pending', window.location.origin)
      pendingUrl.searchParams.set('email', email)
      if (appCallback) {
        pendingUrl.searchParams.set('app_callback', appCallback)
      }
      router.push(pendingUrl.toString().replace(window.location.origin, ''))
    }
  }

  return (
    <>
      {/* Error Message */}
      {error && (
        <div
          className="mb-4 p-4 rounded-lg text-sm"
          style={{
            background: isEmailAlreadyRegistered ? 'var(--warning-bg)' : 'var(--error-bg)',
            border: isEmailAlreadyRegistered ? '1px solid var(--warning-border)' : '1px solid var(--error-bg-strong)',
            color: isEmailAlreadyRegistered ? 'var(--warning)' : 'var(--error)'
          }}
        >
          <div className="flex items-start gap-3">
            {isEmailAlreadyRegistered ? (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div>
              <p className="font-medium">{error}</p>
              {isEmailAlreadyRegistered && (
                <p className="mt-1 text-sm opacity-90">
                  {t.errors.emailAlreadyRegisteredDetail}
                  <Link
                    href={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}${appCallback ? `${redirect !== '/' ? '&' : '?'}app_callback=${encodeURIComponent(appCallback)}` : ''}`}
                    className="underline font-medium ml-1 hover:opacity-80"
                  >
                    {t.signup.loginLink}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            {t.displayName}
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            placeholder={t.signup.displayNamePlaceholder}
          />
        </div>

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
            minLength={6}
            className="input"
            placeholder={t.login.passwordPlaceholder}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            {t.confirmPassword}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="input"
            placeholder={t.login.passwordPlaceholder}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-3 mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.signup.loading}
            </span>
          ) : (
            t.signup.button
          )}
        </button>
      </form>

      {/* Terms */}
      <p className="text-xs text-center mt-4" style={{ color: 'var(--foreground-muted)' }}>
        {t.signup.termsPrefix}
        <Link href="/terms" className="hover:underline" style={{ color: 'var(--centra-primary)' }} target="_blank">
          {t.signup.termsLink}
        </Link>
        {t.signup.termsMiddle}
        <Link href="/privacy" className="hover:underline" style={{ color: 'var(--centra-primary)' }} target="_blank">
          {t.signup.privacyLink}
        </Link>
        {t.signup.termsSuffix}
      </p>
    </>
  )
}
