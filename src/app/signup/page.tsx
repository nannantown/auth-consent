'use client'

import { Suspense } from 'react'
import { SignupForm } from './signup-form'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function SignupPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, var(--centra-secondary), var(--centra-primary))' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-accent))' }}
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
          <h1 className="text-2xl font-bold gradient-text mb-1">{t.signup.title}</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{t.signup.subtitle}</p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <SignupForm />
        </Suspense>

        {/* Already have an account */}
        <div className="mt-6 text-center">
          <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{t.signup.hasAccount}</span>
          {' '}
          <Link href="/login" className="text-sm font-medium hover:underline" style={{ color: 'var(--centra-primary)' }}>
            {t.signup.loginLink}
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
