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
import { getCategoryBySlug, UserCategory } from '@/types/category'
import { CATEGORY_TEMPLATES } from '@/types/graph'
import { getUserCategories, addUserCategory, removeUserCategory } from '@/lib/categories'
import { AddCategoryModal } from '@/components/categories'
import { useI18n } from '@/lib/i18n'
import {
  Sidebar,
  DashboardHeader,
  SpaceCard,
  AddSpaceCard,
  MobileNav,
} from '@/components/dashboard'

export default function DashboardPage() {
  const router = useRouter()
  const { t, language } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<FullProfile | null>(null)
  const [userCategories, setUserCategories] = useState<UserCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

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

  // Available categories for the modal (using templates as source)
  const availableCategories = CATEGORY_TEMPLATES.filter(t => t.slug !== 'profile').map(t => ({
    slug: t.slug,
    name: t.name,
    nameEn: t.name_en,
    description: t.description,
    descriptionEn: t.description_en,
    color: t.color,
  }))

  // Determine card sizes
  const getCardSize = (index: number): 'large' | 'medium' | 'small' => {
    if (index === 0) return 'large'
    if (index <= 4) return 'medium'
    return 'small'
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex">
        {/* Left: Sidebar (desktop only) */}
        <Sidebar
          categories={enabledCategories}
          language={language}
          avatarUrl={profile.profile?.avatar_url || null}
          displayName={displayName}
          email={user.email || ''}
          onAddSpace={() => setShowAddModal(true)}
        />

        {/* Right: Main Content */}
        <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8 pb-20 md:pb-8">
          {/* Header */}
          <DashboardHeader
            displayName={displayName}
            email={user.email || ''}
          />

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 opacity-0 animate-fade-in stagger-1">
            {enabledCategories.map((category, index) => (
              <SpaceCard
                key={category.slug}
                category={category}
                language={language}
                size={getCardSize(index)}
                completion={index === 0 && category.slug === 'profile' ? completion : undefined}
              />
            ))}

            {/* Add Space Card */}
            <AddSpaceCard
              onClick={() => setShowAddModal(true)}
              label={t.dashboard.addSpace}
            />
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        categories={enabledCategories}
        avatarUrl={profile.profile?.avatar_url || null}
        displayName={displayName}
        email={user.email || ''}
        onAddSpace={() => setShowAddModal(true)}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCategory}
        enabledSlugs={enabledSlugs}
        availableCategories={availableCategories}
      />
    </div>
  )
}
