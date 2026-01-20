'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginCompleteContent() {
  const searchParams = useSearchParams()
  const appCallback = searchParams.get('app_callback')

  const [redirecting, setRedirecting] = useState(!!appCallback)

  const handleRedirect = useCallback(() => {
    if (!appCallback) return
    try {
      window.location.href = appCallback
    } catch {
      setRedirecting(false)
    }
  }, [appCallback])

  useEffect(() => {
    if (!appCallback) return

    const redirectTimer = setTimeout(() => {
      handleRedirect()
    }, 1500)

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
            ログインしました
          </h1>
          <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
            ログインが完了しました。
          </p>

          {appCallback ? (
            redirecting ? (
              <div className="flex items-center justify-center gap-2" style={{ color: 'var(--foreground-muted)' }}>
                <div className="w-4 h-4 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
                <span>アプリに戻っています...</span>
              </div>
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
                  アプリが自動的に開かない場合は、下のボタンをタップしてください
                </p>
                <a
                  href={appCallback}
                  className="btn btn-primary inline-block px-6 py-3"
                >
                  アプリを開く
                </a>
              </>
            )
          ) : (
            <Link
              href="/profile"
              className="btn btn-primary inline-block px-6 py-3"
            >
              プロフィールへ
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-8 h-8 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginCompleteContent />
    </Suspense>
  )
}
