'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoginForm } from './login-form'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

function LoginPageContent() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const appCallback = searchParams.get('app_callback')
  const confirmationSent = searchParams.get('confirmation_sent') === 'true'
  const confirmationEmail = searchParams.get('email')
  const emailVerified = searchParams.get('email_verified') === 'true'

  // Build signup URL with parameters
  const signupUrl = (() => {
    const params = new URLSearchParams()
    if (redirect && redirect !== '/') {
      params.set('redirect', redirect)
    }
    if (appCallback) {
      params.set('app_callback', appCallback)
    }
    const queryString = params.toString()
    return queryString ? `/signup?${queryString}` : '/signup'
  })()

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="max-w-md w-full opacity-0 animate-scale-in p-6"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="mx-auto">
              <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="var(--text-secondary)" strokeWidth="1.5" fill="none"/>
              <circle cx="16" cy="16" r="3" fill="var(--text-secondary)"/>
            </svg>
          </Link>
          <h1 className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t.login.title}</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.login.subtitle}</p>
        </div>

        {/* Confirmation email sent message */}
        {confirmationSent && (
          <div
            className="mb-5 p-3 text-xs"
            style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--success)',
            }}
          >
            <p className="font-medium">{t.login.confirmationSentTitle}</p>
            <p className="mt-1 opacity-80">
              {confirmationEmail
                ? t.login.confirmationSentMessageWithEmail.replace('{email}', confirmationEmail)
                : t.login.confirmationSentMessage}
            </p>
          </div>
        )}

        {/* Email verified message */}
        {emailVerified && !confirmationSent && (
          <div
            className="mb-5 p-3 text-xs"
            style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--success)',
            }}
          >
            <p className="font-medium">{t.login.emailVerifiedTitle}</p>
            <p className="mt-1 opacity-80">{t.login.emailVerifiedMessage}</p>
          </div>
        )}

        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div
              className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
            />
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Sign up link */}
        <div className="mt-6 text-center">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.login.noAccount}</span>
          {' '}
          <Link href={signupUrl} className="text-xs font-medium hover:underline" style={{ color: 'var(--text-secondary)' }}>
            {t.login.signupLink}
          </Link>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-center mt-6" style={{ color: 'var(--text-muted)' }}>
          {t.login.footer}
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div
          className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
        />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
