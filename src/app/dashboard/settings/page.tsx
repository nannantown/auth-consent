'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useI18n } from '@/lib/i18n'
import { ExportButton } from '@/components/data'
import { ImportModal } from '@/components/data'

export default function SettingsPage() {
  const router = useRouter()
  const { t, language, setLanguage } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/dashboard/settings')
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase])

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    const confirmWord = t.deleteAccount.confirmWord
    if (deleteConfirmText !== confirmWord) return

    setDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete account')
      router.push('/')
    } catch (error) {
      console.error('Delete account error:', error)
      setDeleteError(t.deleteAccount.error)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-lg mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-xs mb-6 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          {t.nav.back}
        </button>

        {/* Title */}
        <h1
          className="text-xl font-semibold tracking-tight mb-8"
          style={{ color: 'var(--text-primary)' }}
        >
          {t.settings.title}
        </h1>

        {/* Language */}
        <section className="mb-8">
          <h2
            className="text-xs font-medium uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {t.settings.language}
          </h2>
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage('ja')}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-150"
                style={{
                  background: language === 'ja' ? '#fff' : 'transparent',
                  color: language === 'ja' ? '#000' : 'var(--text-secondary)',
                  border: language === 'ja' ? '1px solid #fff' : '1px solid var(--border-default)',
                }}
              >
                日本語
              </button>
              <button
                onClick={() => setLanguage('en')}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-150"
                style={{
                  background: language === 'en' ? '#fff' : 'transparent',
                  color: language === 'en' ? '#000' : 'var(--text-secondary)',
                  border: language === 'en' ? '1px solid #fff' : '1px solid var(--border-default)',
                }}
              >
                English
              </button>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="mb-8">
          <h2
            className="text-xs font-medium uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {t.settings.dataManagement}
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              className="[&>button]:w-full [&>button]:text-left [&>button]:px-4 [&>button]:py-3"
            >
              <ExportButton userId={user.id} />
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
            <button
              onClick={() => setShowImportModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {t.data.import}
            </button>
          </div>
        </section>

        {/* Account */}
        <section className="mb-8">
          <h2
            className="text-xs font-medium uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {t.settings.account}
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors disabled:opacity-40"
              style={{ color: 'var(--text-secondary)' }}
            >
              {loggingOut ? (
                <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              {loggingOut ? t.nav.loggingOut : t.nav.logout}
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2
            className="text-xs font-medium uppercase tracking-widest mb-3"
            style={{ color: 'var(--error)' }}
          >
            {t.settings.dangerZone}
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <div className="px-4 py-3">
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                {t.deleteAccount.description}
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-danger text-xs"
              >
                {t.deleteAccount.button}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        userId={user.id}
        onImported={() => {}}
      />

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div
            className="relative w-full max-w-md animate-scale-in"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="p-6">
              <h3
                className="text-sm font-medium text-center mb-2"
                style={{ color: 'var(--error)' }}
              >
                {t.deleteAccount.confirmTitle}
              </h3>
              <p
                className="text-xs text-center mb-5"
                style={{ color: 'var(--text-muted)' }}
              >
                {t.deleteAccount.confirmMessage}
              </p>
              {deleteError && (
                <div
                  className="mb-4 p-3 text-xs text-center"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--error)',
                  }}
                >
                  {deleteError}
                </div>
              )}
              <div className="mb-5">
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={t.deleteAccount.confirmPlaceholder}
                  className="input"
                  disabled={deleting}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmText('')
                    setDeleteError(null)
                  }}
                  disabled={deleting}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  {t.deleteAccount.cancel}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmText !== t.deleteAccount.confirmWord}
                  className="btn btn-danger flex-1 text-sm disabled:opacity-40"
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t.deleteAccount.deleting}
                    </span>
                  ) : (
                    t.deleteAccount.button
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
