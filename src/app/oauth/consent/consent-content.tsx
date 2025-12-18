'use client'

import { useI18n } from '@/lib/i18n'
import { ConsentButtons } from './consent-buttons'

interface ConsentContentProps {
  authorizationId: string
}

export function ConsentContent({ authorizationId }: ConsentContentProps) {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldIcon />
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t.consent.title}</h1>
        </div>

        {/* Client Info */}
        <div className="mb-6">
          <p className="text-gray-600 text-center">
            {t.consent.requestAccess}
          </p>
        </div>

        {/* Client-side consent buttons */}
        <ConsentButtons authorizationId={authorizationId} />

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          {t.consent.footer}
        </p>
      </div>
    </div>
  )
}

export function ConsentError({ message }: { message?: string }) {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="text-red-600 text-center">
          <ErrorIcon />
          <h2 className="text-lg font-semibold mb-2">{t.consent.error}</h2>
          <p className="text-gray-600">{message || t.consent.noAuthorizationId}</p>
        </div>
      </div>
    </div>
  )
}

function ErrorIcon() {
  return (
    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}
