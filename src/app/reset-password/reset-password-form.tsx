'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export function ResetPasswordForm() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  const verified = searchParams.get('verified') === 'true'
  const urlError = searchParams.get('error')

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setHasSession(!!session)
      setSessionChecked(true)
    }
    checkSession()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
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

    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (!sessionChecked) {
    return (
      <div className="text-center py-6">
        <div className="w-8 h-8 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm mt-3" style={{ color: 'var(--foreground-muted)' }}>{t.resetPassword.checking}</p>
      </div>
    )
  }

  // Show error if link was invalid
  if (urlError === 'invalid_link' || (!hasSession && !verified)) {
    return (
      <div className="text-center py-6">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'linear-gradient(135deg, var(--error), var(--error-hover))',
            boxShadow: 'var(--error-glow)'
          }}
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{t.resetPassword.invalidLinkTitle}</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
          {t.resetPassword.invalidLinkMessage}
        </p>
        <Link
          href="/forgot-password"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--centra-primary)' }}
        >
          {t.resetPassword.sendNewEmail}
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'linear-gradient(135deg, var(--p-emerald-500), #059669)',
            boxShadow: 'var(--success-glow)'
          }}
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{t.resetPassword.successTitle}</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
          {t.resetPassword.successMessage}
        </p>
        <Link
          href="/login"
          className="btn btn-primary px-6 py-2"
        >
          {t.resetPassword.loginButton}
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Error Message */}
      {error && (
        <div
          className="mb-4 p-4 rounded-lg text-sm"
          style={{
            background: 'var(--error-bg)',
            border: '1px solid var(--error-bg-strong)',
            color: 'var(--error)'
          }}
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            {t.resetPassword.newPassword}
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
              {t.resetPassword.loading}
            </span>
          ) : (
            t.resetPassword.button
          )}
        </button>
      </form>
    </>
  )
}
