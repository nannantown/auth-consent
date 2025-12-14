'use client'

import { useEffect, useState } from 'react'

interface RedirectToAppProps {
  code: string
  state?: string
}

export function RedirectToApp({ code, state }: RedirectToAppProps) {
  const [redirecting, setRedirecting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // アプリへのリダイレクトURLを構築
    const appUrl = new URL('io.supabase.murderrpg://auth/callback')
    appUrl.searchParams.set('code', code)
    if (state) {
      appUrl.searchParams.set('state', state)
    }

    // リダイレクトを試行
    try {
      window.location.href = appUrl.toString()

      // 3秒後もまだこのページにいる場合は、手動リンクを表示
      setTimeout(() => {
        setRedirecting(false)
      }, 3000)
    } catch (e) {
      setError('リダイレクトに失敗しました')
      setRedirecting(false)
    }
  }, [code, state])

  const appUrl = `io.supabase.murderrpg://auth/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`

  if (redirecting) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">アプリに戻っています...</h1>
        <p className="text-gray-600 text-sm">自動的にアプリが開きます</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">認証が完了しました</h1>

      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      <p className="text-gray-600 mb-6">
        アプリが自動的に開かない場合は、下のボタンをタップしてください
      </p>

      <a
        href={appUrl}
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        アプリを開く
      </a>
    </div>
  )
}
