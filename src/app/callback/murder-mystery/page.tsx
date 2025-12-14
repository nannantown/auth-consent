import { RedirectToApp } from './redirect-to-app'

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; state?: string; error?: string; error_description?: string }>
}) {
  const params = await searchParams

  if (params.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">認証エラー</h1>
            <p className="text-red-600 mb-2">{params.error}</p>
            {params.error_description && (
              <p className="text-gray-600 text-sm">{params.error_description}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (params.code) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <RedirectToApp code={params.code} state={params.state} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">パラメータがありません</h1>
          <p className="text-gray-600">code または error パラメータが必要です。</p>
        </div>
      </div>
    </div>
  )
}
