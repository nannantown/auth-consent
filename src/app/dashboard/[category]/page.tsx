'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import {
  getFullProfile,
} from '@/lib/profile'
import { FullProfile } from '@/types/profile'
import { getCategoryBySlug, Category } from '@/types/category'
import { ProfileSection } from '@/components/profile'
import { useI18n } from '@/lib/i18n'
import {
  Product,
  ProductInput,
  RoadmapItem,
  RoadmapItemInput,
  ProductKPI,
  ProductKPIInput,
} from '@/types/product'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getRoadmapItems,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
  getProductKPIs,
  createProductKPI,
  updateProductKPI,
  deleteProductKPI,
} from '@/lib/products'
import {
  ProductCard,
  ProductForm,
  RoadmapSection,
  KPISection,
} from '@/components/product'

export default function CategoryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const categorySlug = params.category as string
  const { t, language } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<FullProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const category = getCategoryBySlug(categorySlug)

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const data = await getFullProfile(supabase, userId)
      setProfile(data)
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }, [supabase])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/dashboard')
        return
      }
      setUser(user)
      await loadProfile(user.id)
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase, loadProfile])

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

  if (!user || !category) {
    router.push('/dashboard')
    return null
  }

  const categoryName = language === 'en' ? category.nameEn : category.name
  const categoryDesc = language === 'en' ? category.descriptionEn : category.description

  // For profile category, show actual profile data
  if (categorySlug === 'profile' && profile) {
    return (
      <ProfileDetailView
        user={user}
        profile={profile}
        category={category}
        t={t}
        language={language}
      />
    )
  }

  // For product category, show product management view
  if (categorySlug === 'product') {
    return (
      <ProductManagementDetailView
        user={user}
        category={category}
        language={language}
      />
    )
  }

  // For other categories, show "Coming Soon" view
  return (
    <div className="min-h-screen relative" style={{ background: 'var(--background)' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${category.color} 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--centra-secondary) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <nav className="flex items-center justify-between mb-8 opacity-0 animate-fade-in">
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {language === 'en' ? 'Back' : '戻る'}
          </Link>

          {/* Category Icon & Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: `linear-gradient(135deg, ${category.color}40, ${category.color}20)`,
              }}
            >
              {category.icon}
            </div>
            <span
              className="text-lg font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              {categoryName}
            </span>
          </div>

          {/* Spacer */}
          <div className="w-20" />
        </nav>

        {/* Coming Soon Card */}
        <div className="opacity-0 animate-fade-in stagger-1">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(17, 24, 39, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="px-6 py-12 text-center">
              {/* Icon */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6"
                style={{
                  background: `linear-gradient(135deg, ${category.color}30, ${category.color}15)`,
                }}
              >
                {category.icon}
              </div>

              {/* Title */}
              <h1
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                {language === 'en' ? 'Coming Soon' : '近日公開予定'}
              </h1>

              {/* Description */}
              <p
                className="text-sm mb-8 max-w-sm mx-auto"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {language === 'en'
                  ? `Detailed features for ${categoryName} are under development.`
                  : `${categoryName}の詳細機能は現在開発中です。`}
              </p>

              {/* What you'll be able to manage */}
              <div
                className="rounded-xl p-6 text-left max-w-sm mx-auto"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <p
                  className="text-xs uppercase tracking-wider mb-3"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {language === 'en' ? 'You will be able to manage:' : '管理できるようになる予定：'}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--foreground)' }}
                >
                  {categoryDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center opacity-0 animate-fade-in stagger-2">
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            Powered by Centra
          </p>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${category.color}, var(--centra-secondary), transparent)`,
        }}
      />
    </div>
  )
}

// Profile Detail View Component
function ProfileDetailView({
  user,
  profile,
  category,
  t,
  language,
}: {
  user: User
  profile: FullProfile
  category: Category
  t: ReturnType<typeof import('@/lib/i18n').useI18n>['t']
  language: string
}) {
  const displayName = profile.profile
    ? `${profile.profile.last_name || ''} ${profile.profile.first_name || ''}`.trim()
    : null

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--background)' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${category.color} 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--centra-secondary) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <nav className="flex items-center justify-between mb-8 opacity-0 animate-fade-in">
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {language === 'en' ? 'Back' : '戻る'}
          </Link>

          {/* Category Icon & Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: `linear-gradient(135deg, ${category.color}40, ${category.color}20)`,
              }}
            >
              {category.icon}
            </div>
            <span
              className="text-lg font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              {language === 'en' ? category.nameEn : category.name}
            </span>
          </div>

          {/* Spacer */}
          <div className="w-20" />
        </nav>

        {/* Basic Info Section */}
        <div className="opacity-0 animate-fade-in stagger-1">
          <ProfileSection
            title={t.profile?.basicInfo || 'Basic Information'}
            editHref="/profile/edit"
            isEmpty={!profile.profile}
            emptyMessage={t.profile?.noBasicInfo || 'No basic information registered'}
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          >
            {profile.profile && (
              <div className="grid gap-4">
                {/* Email */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--centra-secondary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--foreground-muted)' }}>
                      {language === 'en' ? 'Email' : 'メールアドレス'}
                    </p>
                    <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Name */}
                {displayName && (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--centra-primary)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--foreground-muted)' }}>
                        {t.profile?.name || 'Name'}
                      </p>
                      <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                        {displayName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {profile.profile.phone && (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--centra-secondary)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--foreground-muted)' }}>
                        {t.profile?.phone || 'Phone'}
                      </p>
                      <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                        {profile.profile.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Address */}
                {profile.profile.prefecture && (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--centra-accent)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--foreground-muted)' }}>
                        {t.profile?.address || 'Address'}
                      </p>
                      <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                        {[profile.profile.prefecture, profile.profile.city].filter(Boolean).join(' ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Birth Date */}
                {profile.profile.date_of_birth && (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--centra-primary-light)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--foreground-muted)' }}>
                        {t.profile?.dateOfBirth || 'Birth Date'}
                      </p>
                      <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                        {profile.profile.date_of_birth}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ProfileSection>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center opacity-0 animate-fade-in stagger-2">
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            Powered by Centra
          </p>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${category.color}, var(--centra-secondary), transparent)`,
        }}
      />
    </div>
  )
}

// Product Management Detail View Component
function ProductManagementDetailView({
  user,
  category,
  language,
}: {
  user: User
  category: Category
  language: string
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([])
  const [kpis, setKPIs] = useState<ProductKPI[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  // Load products
  const loadProducts = useCallback(async () => {
    const data = await getProducts(user.id)
    setProducts(data)
    if (data.length > 0 && !selectedProduct) {
      setSelectedProduct(data[0])
    }
    setLoading(false)
  }, [user.id, selectedProduct])

  // Load roadmap items for selected product
  const loadRoadmapItems = useCallback(async () => {
    if (!selectedProduct) {
      setRoadmapItems([])
      return
    }
    const data = await getRoadmapItems(selectedProduct.id)
    setRoadmapItems(data)
  }, [selectedProduct])

  // Load KPIs for selected product
  const loadKPIs = useCallback(async () => {
    if (!selectedProduct) {
      setKPIs([])
      return
    }
    const data = await getProductKPIs(selectedProduct.id)
    setKPIs(data)
  }, [selectedProduct])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    loadRoadmapItems()
    loadKPIs()
  }, [loadRoadmapItems, loadKPIs])

  // Product handlers
  const handleCreateProduct = async (input: ProductInput) => {
    const result = await createProduct(user.id, input)
    if (result) {
      await loadProducts()
      setSelectedProduct(result)
      setShowProductForm(false)
    }
  }

  const handleUpdateProduct = async (input: ProductInput) => {
    if (!editingProduct) return
    const result = await updateProduct(editingProduct.id, input)
    if (result) {
      await loadProducts()
      if (selectedProduct?.id === editingProduct.id) {
        setSelectedProduct(result)
      }
      setEditingProduct(null)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    const success = await deleteProduct(productId)
    if (success) {
      await loadProducts()
      if (selectedProduct?.id === productId) {
        setSelectedProduct(products.find(p => p.id !== productId) || null)
      }
    }
  }

  // Roadmap handlers
  const handleAddRoadmapItem = async (input: RoadmapItemInput) => {
    const result = await createRoadmapItem(user.id, input)
    if (result) {
      await loadRoadmapItems()
    }
  }

  const handleUpdateRoadmapItem = async (itemId: string, input: Partial<RoadmapItemInput>) => {
    const result = await updateRoadmapItem(itemId, input)
    if (result) {
      await loadRoadmapItems()
    }
  }

  const handleDeleteRoadmapItem = async (itemId: string) => {
    const success = await deleteRoadmapItem(itemId)
    if (success) {
      await loadRoadmapItems()
    }
  }

  // KPI handlers
  const handleAddKPI = async (input: ProductKPIInput) => {
    const result = await createProductKPI(user.id, input)
    if (result) {
      await loadKPIs()
    }
  }

  const handleUpdateKPI = async (kpiId: string, input: Partial<ProductKPIInput>) => {
    const result = await updateProductKPI(kpiId, input)
    if (result) {
      await loadKPIs()
    }
  }

  const handleDeleteKPI = async (kpiId: string) => {
    const success = await deleteProductKPI(kpiId)
    if (success) {
      await loadKPIs()
    }
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--background)' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${category.color} 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--centra-secondary) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <nav className="flex items-center justify-between mb-8 opacity-0 animate-fade-in">
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {language === 'en' ? 'Back' : '戻る'}
          </Link>

          {/* Category Icon & Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: `linear-gradient(135deg, ${category.color}40, ${category.color}20)`,
              }}
            >
              {category.icon}
            </div>
            <span
              className="text-lg font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              {language === 'en' ? category.nameEn : category.name}
            </span>
          </div>

          {/* Spacer */}
          <div className="w-20" />
        </nav>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 opacity-0 animate-fade-in stagger-1">
            {/* Products Section */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(17, 24, 39, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="px-6 py-4 flex items-center justify-between border-b"
                style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${category.color}30` }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: category.color }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                    {language === 'en' ? 'Products' : 'プロダクト'}
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--foreground-muted)',
                    }}
                  >
                    {products.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
                  style={{ color: category.color }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {language === 'en' ? 'Add' : '追加'}
                </button>
              </div>

              <div className="p-4">
                {showProductForm ? (
                  <ProductForm
                    onSave={handleCreateProduct}
                    onCancel={() => setShowProductForm(false)}
                  />
                ) : editingProduct ? (
                  <ProductForm
                    product={editingProduct}
                    onSave={handleUpdateProduct}
                    onCancel={() => setEditingProduct(null)}
                  />
                ) : products.length === 0 ? (
                  <div
                    className="text-center py-8 rounded-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                      style={{ background: `${category.color}20` }}
                    >
                      {category.icon}
                    </div>
                    <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                      {language === 'en' ? 'No products yet' : 'プロダクトがありません'}
                    </p>
                    <p className="text-xs mb-4" style={{ color: 'var(--foreground-muted)' }}>
                      {language === 'en'
                        ? 'Add your first product to start tracking'
                        : '最初のプロダクトを追加して管理を始めましょう'}
                    </p>
                    <button
                      onClick={() => setShowProductForm(true)}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      style={{
                        background: category.color,
                        color: 'white',
                      }}
                    >
                      {language === 'en' ? 'Add Product' : 'プロダクトを追加'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isSelected={selectedProduct?.id === product.id}
                        onSelect={setSelectedProduct}
                        onEdit={setEditingProduct}
                        onDelete={handleDeleteProduct}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Roadmap Section - Only show if product selected */}
            {selectedProduct && (
              <div className="opacity-0 animate-fade-in stagger-2">
                <RoadmapSection
                  items={roadmapItems}
                  productId={selectedProduct.id}
                  onAdd={handleAddRoadmapItem}
                  onUpdate={handleUpdateRoadmapItem}
                  onDelete={handleDeleteRoadmapItem}
                />
              </div>
            )}

            {/* KPI Section - Only show if product selected */}
            {selectedProduct && (
              <div className="opacity-0 animate-fade-in stagger-3">
                <KPISection
                  kpis={kpis}
                  productId={selectedProduct.id}
                  onAdd={handleAddKPI}
                  onUpdate={handleUpdateKPI}
                  onDelete={handleDeleteKPI}
                />
              </div>
            )}

            {/* Product Details - Vision & Mission */}
            {selectedProduct && (selectedProduct.vision || selectedProduct.mission) && (
              <div
                className="rounded-2xl overflow-hidden opacity-0 animate-fade-in stagger-4"
                style={{
                  background: 'rgba(17, 24, 39, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="px-6 py-4 border-b"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(139, 92, 246, 0.2)' }}
                    >
                      <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {language === 'en' ? 'Vision & Mission' : 'ビジョン & ミッション'}
                    </h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {selectedProduct.vision && (
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--foreground-muted)' }}>
                        {language === 'en' ? 'Vision' : 'ビジョン'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                        {selectedProduct.vision}
                      </p>
                    </div>
                  )}
                  {selectedProduct.mission && (
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--foreground-muted)' }}>
                        {language === 'en' ? 'Mission' : 'ミッション'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                        {selectedProduct.mission}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center opacity-0 animate-fade-in stagger-4">
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            Powered by Centra
          </p>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${category.color}, var(--centra-secondary), transparent)`,
        }}
      />
    </div>
  )
}
