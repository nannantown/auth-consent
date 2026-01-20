'use client'

import { Suspense } from 'react'
import { ResetPasswordForm } from './reset-password-form'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function ResetPasswordPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, var(--centra-secondary), var(--centra-accent))' }}
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-bold gradient-text mb-1">{t.resetPassword.title}</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{t.resetPassword.subtitle}</p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
