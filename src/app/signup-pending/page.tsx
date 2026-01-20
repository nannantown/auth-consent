'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

function SignupPendingContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const appCallback = searchParams.get('app_callback')
  const { t } = useI18n()

  const handleReturnToApp = () => {
    if (appCallback) {
      const separator = appCallback.includes('?') ? '&' : '?'
      window.location.href = `${appCallback}${separator}type=signup_pending`
    }
  }

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
        <div className="text-center">
          {/* Email Icon */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 0 30px -8px #10b981'
            }}
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold gradient-text mb-2">
            {t.signupPending?.title || '確認メールを送信しました'}
          </h1>

          <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
            {email ? (
              <>
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>{email}</span>
                <br />
                {t.signupPending?.messageWithEmail || 'に確認メールを送信しました。メール内のリンクをクリックして、アカウントを有効化してください。'}
              </>
            ) : (
              t.signupPending?.message || '確認メールを送信しました。メール内のリンクをクリックして、アカウントを有効化してください。'
            )}
          </p>

          {/* Info box */}
          <div
            className="p-4 rounded-lg text-sm mb-6 text-left"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--centra-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p style={{ color: 'var(--foreground-muted)' }}>
                {t.signupPending?.hint || 'メールが届かない場合は、迷惑メールフォルダをご確認ください。'}
              </p>
            </div>
          </div>

          {appCallback ? (
            <button
              onClick={handleReturnToApp}
              className="btn btn-primary w-full py-3"
            >
              {t.signupPending?.returnToApp || 'アプリに戻る'}
            </button>
          ) : (
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {t.signupPending?.closeWindow || 'このウィンドウを閉じて、メールをご確認ください。'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SignupPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupPendingContent />
    </Suspense>
  )
}
