'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import {
  getFullProfile,
  calculateProfileCompletion,
} from '@/lib/profile'
import { FullProfile } from '@/types/profile'
import { CATEGORIES, getCategoryBySlug, UserCategory } from '@/types/category'
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

      // Redirect to home page after successful deletion
      router.push('/')
    } catch (error) {
      console.error('Delete account error:', error)
      setDeleteError(t.deleteAccount.error)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--centra-primary)', borderTopColor: 'transparent' }}
          />
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-50"
            style={{ background: 'var(--centra-primary)' }}
          />
        </div>
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

  const basicInfoLabel = language === 'en' ? 'Profile' : '基本情報'

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--background)' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orb */}
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--centra-primary) 0%, transparent 70%)',
          }}
        />
        {/* Secondary gradient orb */}
        <div
          className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--centra-secondary) 0%, transparent 70%)',
          }}
        />
        {/* Accent gradient orb */}
        <div
          className="absolute -bottom-20 right-1/4 w-[300px] h-[300px] rounded-full opacity-10 blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--centra-accent) 0%, transparent 70%)',
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative max-w-2xl mx-auto px-4 py-8">
        {/* Top Navigation */}
        <nav className="relative z-50 flex items-center justify-between mb-8 opacity-0 animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-primary-dark))',
                boxShadow: '0 4px 20px -5px var(--centra-primary)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="16" cy="16" r="4" fill="white"/>
              </svg>
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Centra
            </span>
          </div>

          {/* Settings Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:bg-white/5"
              style={{ color: 'var(--foreground-muted)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </button>

            {/* Dropdown */}
            {showSettingsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSettingsMenu(false)}
                />
                <div
                  className="absolute right-0 top-12 z-50 w-48 rounded-xl py-1 shadow-xl opacity-0 animate-scale-in backdrop-blur-xl"
                  style={{
                    background: 'rgba(20, 20, 35, 0.95)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false)
                      handleLogout()
                    }}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 hover:bg-white/5 disabled:opacity-50"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {loggingOut ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    )}
                    {loggingOut ? t.nav.loggingOut : t.nav.logout}
                  </button>
                  <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false)
                      setShowDeleteModal(true)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 hover:bg-red-500/10"
                    style={{ color: '#ef4444' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t.deleteAccount.button}
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Profile Header */}
        <div className="mb-6 opacity-0 animate-fade-in stagger-1">
          <ProfileHeader
            name={displayName}
            email={user.email || ''}
            avatarUrl={profile.profile?.avatar_url || null}
            completion={completion}
          />
        </div>

        {/* Profile Category Card (Always Visible) */}
        <div className="mb-4 opacity-0 animate-fade-in stagger-2">
          <CategoryCard
            category={profileCategory}
            isEmpty={!profile.profile}
            emptyMessage={language === 'en' ? 'No basic info registered' : 'まだ基本情報が登録されていません'}
          />
        </div>

        {/* User's Enabled Categories */}
        {enabledCategories.length > 0 && (
          <div className="space-y-4 mb-4 opacity-0 animate-fade-in stagger-3">
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
        <div className="mt-12 text-center opacity-0 animate-fade-in stagger-4">
          <p className="text-xs mb-4" style={{ color: 'var(--foreground-muted)' }}>
            Powered by Centra
          </p>

          {/* Language Switcher */}
          <div className="flex items-center justify-center gap-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>
            <button
              onClick={() => setLanguage('ja')}
              className={`px-2 py-1 rounded transition-all duration-200 ${
                language === 'ja' ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
              style={{
                color: language === 'ja' ? 'var(--centra-primary)' : 'var(--foreground-muted)',
              }}
            >
              JP
            </button>
            <span style={{ color: 'var(--foreground-muted)', opacity: 0.3 }}>/</span>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded transition-all duration-200 ${
                language === 'en' ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
              style={{
                color: language === 'en' ? 'var(--centra-primary)' : 'var(--foreground-muted)',
              }}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--centra-primary), var(--centra-secondary), var(--centra-accent), transparent)',
        }}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCategory}
        enabledSlugs={enabledSlugs}
      />

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-md rounded-2xl p-6 opacity-0 animate-scale-in"
            style={{
              background: 'linear-gradient(145deg, #2a2a3e 0%, #1e1e2e 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 0 40px -10px rgba(239, 68, 68, 0.3)',
            }}
          >
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: '#ef4444' }}>
              {t.deleteAccount.confirmTitle}
            </h3>

            {/* Message */}
            <p className="text-sm text-center mb-6" style={{ color: 'var(--foreground-muted)' }}>
              {t.deleteAccount.confirmMessage}
            </p>

            {/* Error Message */}
            {deleteError && (
              <div
                className="mb-4 p-3 rounded-lg text-sm text-center"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444'
                }}
              >
                {deleteError}
              </div>
            )}

            {/* Confirmation Input */}
            <div className="mb-6">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={t.deleteAccount.confirmPlaceholder}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                }}
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
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5 disabled:opacity-50"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                {t.deleteAccount.cancel}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== t.deleteAccount.confirmWord}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  background: deleteConfirmText === t.deleteAccount.confirmWord ? '#ef4444' : 'rgba(239, 68, 68, 0.3)',
                  color: 'white',
                }}
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t.deleteAccount.deleting}
                  </span>
                ) : (
                  t.deleteAccount.button
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
