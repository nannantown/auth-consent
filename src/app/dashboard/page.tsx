'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import {
  getFullProfile,
  calculateProfileCompletion,
} from '@/lib/profile'
import { FullProfile } from '@/types/profile'
import { CATEGORIES, getCategoryBySlug, UserCategory } from '@/types/category'
import { CATEGORY_TEMPLATES } from '@/types/graph'
import { getUserCategories, addUserCategory, removeUserCategory } from '@/lib/categories'
import {
  ProfileHeader,
} from '@/components/profile'
import {
  CategoryCard,
  AddCategoryModal,
  AddCategoryButton,
} from '@/components/categories'
import { useI18n } from '@/lib/i18n'
import { ExportButton, ImportModal } from '@/components/data'

export default function DashboardPage() {
  const router = useRouter()
  const { t, language, setLanguage } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<FullProfile | null>(null)
  const [userCategories, setUserCategories] = useState<UserCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  const supabase = createClient()

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const data = await getFullProfile(supabase, userId)
      setProfile(data)
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }, [supabase])

  const loadCategories = useCallback(async (userId: string) => {
    try {
      const categories = await getUserCategories(userId)
      setUserCategories(categories)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/dashboard')
        return
      }
      setUser(user)
      await Promise.all([
        loadProfile(user.id),
        loadCategories(user.id),
      ])
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase, loadProfile, loadCategories])

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleAddCategory = async (slug: string) => {
    if (!user) return
    const result = await addUserCategory(user.id, slug)
    if (result) {
      await loadCategories(user.id)
    }
  }

  const handleRemoveCategory = async (slug: string) => {
    if (!user) return
    const success = await removeUserCategory(user.id, slug)
    if (success) {
      await loadCategories(user.id)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmWord = t.deleteAccount.confirmWord
    if (deleteConfirmText !== confirmWord) return

    setDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

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

  if (!user || !profile) {
    return null
  }

  const completion = calculateProfileCompletion(profile)
  const displayName = profile.profile
    ? `${profile.profile.last_name || ''} ${profile.profile.first_name || ''}`.trim()
    : null

  // Get enabled category objects
  const enabledCategories = userCategories
    .map((uc) => getCategoryBySlug(uc.category_slug))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)

  const enabledSlugs = userCategories.map((uc) => uc.category_slug)

  // Profile category (always visible)
  const profileCategory = CATEGORIES.find((c) => c.slug === 'profile')!

  // Available categories for the modal (using templates as source)
  const availableCategories = CATEGORY_TEMPLATES.filter(t => t.slug !== 'profile').map(t => ({
    slug: t.slug,
    name: t.name,
    nameEn: t.name_en,
    description: t.description,
    descriptionEn: t.description_en,
    color: t.color,
  }))

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Main Content */}
      <div className="max-w-[var(--container-max)] mx-auto px-4 py-6">
        {/* Top Navigation */}
        <nav className="flex items-center justify-between mb-8 opacity-0 animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="var(--text-secondary)" strokeWidth="1.5" fill="none"/>
              <circle cx="16" cy="16" r="3" fill="var(--text-secondary)"/>
            </svg>
            <span
              className="text-sm font-medium tracking-tight"
              style={{ color: 'var(--text-secondary)' }}
            >
              Centra
            </span>
          </div>

          {/* Search + Settings Menu */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/dashboard/search')}
              className="flex items-center justify-center w-8 h-8 rounded transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title={t.search.title}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="flex items-center justify-center w-8 h-8 rounded transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </button>

            {/* Dropdown */}
            {showSettingsMenu && createPortal(
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSettingsMenu(false)}
                />
                <div
                  className="fixed right-4 top-14 z-50 w-44 py-1 animate-scale-in"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <ExportButton userId={user.id} />
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false)
                      setShowImportModal(true)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {t.data.import}
                  </button>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '2px 0' }} />
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false)
                      router.push('/dashboard/sharing')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {t.sharing.title}
                  </button>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '2px 0' }} />
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false)
                      handleLogout()
                    }}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors disabled:opacity-40"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {loggingOut ? (
                      <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    )}
                    {loggingOut ? t.nav.loggingOut : t.nav.logout}
                  </button>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '2px 0' }} />
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false)
                      setShowDeleteModal(true)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors"
                    style={{ color: 'var(--error)' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t.deleteAccount.button}
                  </button>
                </div>
              </>,
              document.body
            )}
          </div>
          </div>
        </nav>

        {/* Profile Header */}
        <div className="mb-4 opacity-0 animate-fade-in stagger-1">
          <ProfileHeader
            name={displayName}
            email={user.email || ''}
            avatarUrl={profile.profile?.avatar_url || null}
            completion={completion}
          />
        </div>

        {/* Spaces Label */}
        <div className="mb-3 opacity-0 animate-fade-in stagger-2">
          <span className="label">
            {t.dashboard.spaces.toUpperCase()}
          </span>
        </div>

        {/* Profile Category Card (Always Visible) */}
        <div className="mb-2 opacity-0 animate-fade-in stagger-2">
          <CategoryCard
            category={profileCategory}
            isEmpty={!profile.profile}
            emptyMessage={t.dashboard.noBasicInfo}
          />
        </div>

        {/* User's Enabled Categories */}
        {enabledCategories.length > 0 && (
          <div className="space-y-2 mb-2 opacity-0 animate-fade-in stagger-3">
            {enabledCategories.map((category) => (
              <CategoryCard
                key={category.slug}
                category={category}
                isEmpty={true}
                canRemove={true}
                onRemove={() => handleRemoveCategory(category.slug)}
              />
            ))}
          </div>
        )}

        {/* Add Category Button */}
        <div className="opacity-0 animate-fade-in stagger-4">
          <AddCategoryButton
            onClick={() => setShowAddModal(true)}
            variant={enabledCategories.length === 0 ? 'prominent' : 'default'}
          />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center opacity-0 animate-fade-in stagger-4">
          <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
            Centra
          </p>

          {/* Language Switcher */}
          <div className="flex items-center justify-center gap-1 text-[10px]">
            <button
              onClick={() => setLanguage('ja')}
              className="px-1.5 py-0.5 transition-colors"
              style={{
                color: language === 'ja' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              JP
            </button>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <button
              onClick={() => setLanguage('en')}
              className="px-1.5 py-0.5 transition-colors"
              style={{
                color: language === 'en' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCategory}
        enabledSlugs={enabledSlugs}
        availableCategories={availableCategories}
      />

      {/* Import Modal */}
      {user && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          userId={user.id}
          onImported={() => {
            loadCategories(user.id)
          }}
        />
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-md animate-scale-in"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="p-6">
              {/* Title */}
              <h3
                className="text-sm font-medium text-center mb-2"
                style={{ color: 'var(--error)' }}
              >
                {t.deleteAccount.confirmTitle}
              </h3>

              {/* Message */}
              <p
                className="text-xs text-center mb-5"
                style={{ color: 'var(--text-muted)' }}
              >
                {t.deleteAccount.confirmMessage}
              </p>

              {/* Error Message */}
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

              {/* Confirmation Input */}
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

              {/* Buttons */}
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
