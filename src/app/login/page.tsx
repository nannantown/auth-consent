'use client'

import { Suspense } from 'react'
import { LoginForm } from './login-form'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function LoginPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t.login.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.login.subtitle}</p>
        </div>

        <Suspense fallback={<div className="text-center py-4">{t.loading}</div>}>
          <LoginForm />
        </Suspense>

        {/* Sign up link */}
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-500">{t.login.noAccount}</span>
          {' '}
          <Link href="/signup" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            {t.login.signupLink}
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          {t.login.footer}
        </p>
      </div>
    </div>
  )
}
