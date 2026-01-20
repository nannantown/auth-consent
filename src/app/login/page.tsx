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
          <h1 className="text-2xl font-bold gradient-text mb-1">{t.login.title}</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{t.login.subtitle}</p>
        </div>

        {/* Confirmation email sent message */}
        {confirmationSent && (
          <div
            className="mb-6 p-4 rounded-lg text-sm"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981'
            }}
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium">{t.login.confirmationSentTitle}</p>
                <p className="mt-1 text-sm opacity-90">
                  {confirmationEmail
                    ? t.login.confirmationSentMessageWithEmail.replace('{email}', confirmationEmail)
                    : t.login.confirmationSentMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Email verified message */}
        {emailVerified && !confirmationSent && (
          <div
            className="mb-6 p-4 rounded-lg text-sm"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981'
            }}
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-medium">{t.login.emailVerifiedTitle}</p>
                <p className="mt-1 text-sm opacity-90">{t.login.emailVerifiedMessage}</p>
              </div>
            </div>
          </div>
        )}

        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Sign up link */}
        <div className="mt-6 text-center">
          <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{t.login.noAccount}</span>
          {' '}
          <Link href={signupUrl} className="text-sm font-medium hover:underline" style={{ color: 'var(--centra-primary)' }}>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
