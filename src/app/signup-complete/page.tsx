'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

function SignupCompleteContent() {
  const searchParams = useSearchParams()
  const appCallback = searchParams.get('app_callback')
  const { t } = useI18n()

  const [redirecting, setRedirecting] = useState(!!appCallback)

  // Build callback URL with type parameter to help Flutter app identify the callback type
  const buildCallbackUrl = useCallback((callback: string) => {
    const separator = callback.includes('?') ? '&' : '?'
    return `${callback}${separator}type=email_verified`
  }, [])

  const handleRedirect = useCallback(() => {
    if (!appCallback) return
    try {
      window.location.href = buildCallbackUrl(appCallback)
    } catch {
      setRedirecting(false)
    }
  }, [appCallback, buildCallbackUrl])

  useEffect(() => {
    if (!appCallback) return

    // 少し遅延してからリダイレクト（ユーザーにメッセージを見せるため）
    const redirectTimer = setTimeout(() => {
      handleRedirect()
    }, 1500)

    // 4秒後もまだこのページにいる場合は、手動リンクを表示
    const fallbackTimer = setTimeout(() => {
      setRedirecting(false)
    }, 4000)

    return () => {
      clearTimeout(redirectTimer)
      clearTimeout(fallbackTimer)
    }
  }, [appCallback, handleRedirect])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div
        className="rounded-xl shadow-lg p-8 max-w-md w-full"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 0 30px -8px #10b981'
            }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            {t.signupComplete?.emailVerifiedTitle || 'メールアドレスが認証されました'}
          </h1>
          <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
            {t.signupComplete?.emailVerifiedMessage || 'アカウントが有効化されました。'}
          </p>

          {appCallback ? (
            redirecting ? (
              <div className="flex items-center justify-center gap-2" style={{ color: 'var(--foreground-muted)' }}>
                <div className="w-4 h-4 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
                <span>{t.signupComplete?.redirecting || 'アプリに戻っています...'}</span>
              </div>
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
                  {t.signupComplete?.manualRedirect || 'アプリが自動的に開かない場合は、下のボタンをタップしてください'}
                </p>
                <a
                  href={buildCallbackUrl(appCallback)}
                  className="btn btn-primary inline-block px-6 py-3"
                >
                  {t.signupComplete?.openApp || 'アプリに戻る'}
                </a>
              </>
            )
          ) : (
            <Link
              href="/login"
              className="btn btn-primary inline-block px-6 py-3"
            >
              {t.signupComplete?.loginButton || 'ログインする'}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SignupCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-8 h-8 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupCompleteContent />
    </Suspense>
  )
}
