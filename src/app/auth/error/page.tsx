'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

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
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: '0 0 30px -8px #ef4444'
            }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            認証エラー
          </h1>
          <p className="mb-2" style={{ color: 'var(--foreground-muted)' }}>
            リンクが無効または期限切れです
          </p>
          {error && (
            <p className="text-sm mb-6 p-2 rounded" style={{
              color: 'var(--foreground-muted)',
              background: 'rgba(255,255,255,0.05)'
            }}>
              {error}
            </p>
          )}

          <div className="space-y-3">
            <Link
              href="/login"
              className="btn btn-primary w-full py-3 block"
            >
              ログインページへ
            </Link>
            <Link
              href="/signup"
              className="btn btn-secondary w-full py-3 block"
            >
              新規登録
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-8 h-8 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
