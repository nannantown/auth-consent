'use client'

import { useEffect, useState, useCallback } from 'react'
import { AppConfig } from '@/lib/app-config'

interface RedirectToAppProps {
  appConfig: AppConfig
  code: string
  state?: string
}

export function RedirectToApp({ appConfig, code, state }: RedirectToAppProps) {
  const [redirecting, setRedirecting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const appUrl = `${appConfig.scheme}://auth/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`

  const handleRedirect = useCallback(() => {
    try {
      window.location.href = appUrl
    } catch {
      setError('リダイレクトに失敗しました')
      setRedirecting(false)
    }
  }, [appUrl])

  useEffect(() => {
    handleRedirect()

    const timer = setTimeout(() => {
      setRedirecting(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [handleRedirect])

  if (redirecting) {
    return (
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: appConfig.colors.background }}
        >
          <svg
            className="w-8 h-8 animate-spin"
            style={{ color: appConfig.colors.primary }}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{appConfig.name}に戻っています...</h1>
        <p className="text-gray-600 text-sm">自動的にアプリが開きます</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: 'rgb(220, 252, 231)' }}
      >
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">認証が完了しました</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <p className="text-gray-600 mb-6">
        アプリが自動的に開かない場合は、下のボタンをタップしてください
      </p>

      <a
        href={appUrl}
        className="inline-block px-6 py-3 text-white rounded-lg transition-colors"
        style={{
          backgroundColor: appConfig.colors.primary,
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = appConfig.colors.primaryHover}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = appConfig.colors.primary}
      >
        {appConfig.name}を開く
      </a>
    </div>
  )
}

interface RedirectWithErrorProps {
  appConfig: AppConfig
  error: string
  errorDescription?: string
  state?: string
}

export function RedirectWithError({ appConfig, error, errorDescription, state }: RedirectWithErrorProps) {
  const [redirecting, setRedirecting] = useState(true)

  const isUserDenied = error === 'access_denied'

  const appUrl = `${appConfig.scheme}://auth/callback?error=${encodeURIComponent(error)}${errorDescription ? `&error_description=${encodeURIComponent(errorDescription)}` : ''}${state ? `&state=${encodeURIComponent(state)}` : ''}`

  const handleRedirect = useCallback(() => {
    try {
      window.location.href = appUrl
    } catch {
      setRedirecting(false)
    }
  }, [appUrl])

  useEffect(() => {
    handleRedirect()

    const timer = setTimeout(() => {
      setRedirecting(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [handleRedirect])

  if (redirecting) {
    return (
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: appConfig.colors.background }}
        >
          <svg
            className="w-8 h-8 animate-spin"
            style={{ color: appConfig.colors.primary }}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{appConfig.name}に戻っています...</h1>
        <p className="text-gray-600 text-sm">自動的にアプリが開きます</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
        style={{ backgroundColor: isUserDenied ? 'rgb(243, 244, 246)' : 'rgb(254, 226, 226)' }}
      >
        {isUserDenied ? (
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        {isUserDenied ? '認証がキャンセルされました' : '認証エラー'}
      </h1>
      <p className="text-gray-600 mb-6">
        {isUserDenied ? 'アプリに戻ります' : errorDescription || error}
      </p>

      <a
        href={appUrl}
        className="inline-block px-6 py-3 text-white rounded-lg transition-colors"
        style={{
          backgroundColor: appConfig.colors.primary,
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = appConfig.colors.primaryHover}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = appConfig.colors.primary}
      >
        {appConfig.name}に戻る
      </a>
    </div>
  )
}
