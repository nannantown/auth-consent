'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useI18n, formatMessage } from '@/lib/i18n'

export function ForgotPasswordForm() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
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
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{t.forgotPassword.successTitle}</h2>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          {formatMessage(t.forgotPassword.successMessage, { email })}
        </p>
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

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-3 mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.forgotPassword.loading}
            </span>
          ) : (
            t.forgotPassword.button
          )}
        </button>
      </form>
    </>
  )
}
