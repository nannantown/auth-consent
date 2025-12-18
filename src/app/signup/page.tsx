'use client'

import { Suspense } from 'react'
import { SignupForm } from './signup-form'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function SignupPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t.signup.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.signup.subtitle}</p>
        </div>

        <Suspense fallback={<div className="text-center py-4">{t.loading}</div>}>
          <SignupForm />
        </Suspense>

        {/* Already have an account */}
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-500">{t.signup.hasAccount}</span>
          {' '}
          <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            {t.signup.loginLink}
          </Link>
        </div>
      </div>
    </div>
  )
}
