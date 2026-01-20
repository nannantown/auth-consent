'use client'

import { Suspense } from 'react'
import { ForgotPasswordForm } from './forgot-password-form'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function ForgotPasswordPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, var(--centra-accent), var(--centra-primary))' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-secondary))' }}
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-bold gradient-text mb-1">{t.forgotPassword.title}</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{t.forgotPassword.subtitle}</p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ForgotPasswordForm />
        </Suspense>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-medium hover:underline" style={{ color: 'var(--centra-primary)' }}>
            {t.forgotPassword.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  )
}
