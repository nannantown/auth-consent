'use client'

import { Suspense } from 'react'
import { ResetPasswordForm } from './reset-password-form'
import { useI18n } from '@/lib/i18n'

export default function ResetPasswordPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t.resetPassword.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.resetPassword.subtitle}</p>
        </div>

        <Suspense fallback={<div className="text-center py-4">{t.loading}</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
