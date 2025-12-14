import { Suspense } from 'react'
import { LoginForm } from './login-form'

export default function LoginPage() {
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
          <h1 className="text-xl font-bold text-gray-900">ログイン</h1>
          <p className="text-sm text-gray-500 mt-1">アカウントにログインしてください</p>
        </div>

        <Suspense fallback={<div className="text-center py-4">読み込み中...</div>}>
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          ログインすることで、アプリへのアクセス許可を管理できます
        </p>
      </div>
    </div>
  )
}
