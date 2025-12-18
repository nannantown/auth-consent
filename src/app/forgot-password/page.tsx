'use client'

import { Suspense } from 'react'
import { ForgotPasswordForm } from './forgot-password-form'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function ForgotPasswordPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t.forgotPassword.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.forgotPassword.subtitle}</p>
        </div>

        <Suspense fallback={<div className="text-center py-4">{t.loading}</div>}>
          <ForgotPasswordForm />
        </Suspense>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
            {t.forgotPassword.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  )
}
