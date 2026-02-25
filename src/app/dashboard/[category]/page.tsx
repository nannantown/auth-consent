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
import {
  getCategoryBySlug as getGraphCategoryBySlug,
  createCategory as createGraphCategory,
  getCategoryWithNodes,
  deleteNode,
  getNodeTypeSchemas,
} from '@/lib/graph'
import { CATEGORY_TEMPLATES, getTemplateBySlug } from '@/types/graph'
import type { Node, NodeTypeSchema, Category as GraphCategory } from '@/types/graph'
import {
  NodeTypeFilter,
  NodeCard,
  NodeFormModal,
  DeleteNodeModal,
  NodeEmptyState,
  NodeSearch,
} from '@/components/nodes'
import { ModuleList } from '@/components/modules'
import { AddEdgeModal } from '@/components/edges'
import { GraphView } from '@/components/graph'
import { CareerView } from '@/components/career'
import { GoalsSpaceView } from '@/components/goals'
import { ContactsView } from '@/components/contacts'
import { LearningView } from '@/components/learning'
import { FinanceView } from '@/components/finance'
import { HealthView } from '@/components/health'
import { LifestyleView } from '@/components/lifestyle'
import { HousingView } from '@/components/housing'
import { BusinessView } from '@/components/business'

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

  // Dedicated module views — wrapped in common page shell
  const dedicatedModules: Record<string, React.ReactNode> = {
    career: <CareerView user={user} categorySlug={categorySlug} category={category} language={language} />,
    goals: <GoalsSpaceView user={user} categorySlug={categorySlug} category={category} language={language} />,
    relationships: <ContactsView user={user} categorySlug={categorySlug} category={category} language={language} />,
    learning: <LearningView user={user} categorySlug={categorySlug} category={category} language={language} />,
    finance: <FinanceView user={user} categorySlug={categorySlug} category={category} language={language} />,
    health: <HealthView user={user} categorySlug={categorySlug} category={category} language={language} />,
    lifestyle: <LifestyleView user={user} categorySlug={categorySlug} category={category} language={language} />,
    housing: <HousingView user={user} categorySlug={categorySlug} category={category} language={language} />,
    business: <BusinessView user={user} categorySlug={categorySlug} category={category} language={language} />,
  }

  if (dedicatedModules[categorySlug]) {
    return (
      <DedicatedModuleShell category={category} language={language}>
        {dedicatedModules[categorySlug]}
      </DedicatedModuleShell>
    )
  }

  // For other categories (user-created), show generic Node list view
  return (
    <NodeListView
      user={user}
      categorySlug={categorySlug}
      category={category}
      language={language}
    />
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
      <div className="relative z-10 max-w-2xl md:max-w-[var(--container-wide)] mx-auto px-4 md:px-8 py-8">
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
      <div className="relative z-10 max-w-2xl md:max-w-[var(--container-wide)] mx-auto px-4 md:px-8 py-8">
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

// Dedicated Module Shell — common wrapper for all dedicated module views
function DedicatedModuleShell({
  category,
  language,
  children,
}: {
  category: Category
  language: string
  children: React.ReactNode
}) {
  const { t } = useI18n()
  const categoryName = language === 'en'
    ? (category.nameEn || category.name)
    : category.name

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[var(--container-max)] md:max-w-[var(--container-wide)] mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            {t.nav.back}
          </Link>

          <div className="flex items-center gap-2">
            {category.color && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: category.color }}
              />
            )}
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {categoryName}
            </span>
          </div>

          {/* Spacer to balance the 3-column layout */}
          <div className="w-12" />
        </div>

        {/* Module content */}
        <div className="animate-fade-in stagger-1">
          {children}
        </div>
      </div>
    </div>
  )
}

// Node List View Component (for all non-profile, non-product categories)
function NodeListView({
  user,
  categorySlug,
  category,
  language,
}: {
  user: User
  categorySlug: string
  category: Category
  language: string
}) {
  const { t } = useI18n()
  const [graphCategory, setGraphCategory] = useState<GraphCategory | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingNode, setEditingNode] = useState<Node | undefined>(undefined)
  const [deletingNode, setDeletingNode] = useState<Node | null>(null)
  const [edgeSourceNode, setEdgeSourceNode] = useState<Node | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list')
  const [showModuleManager, setShowModuleManager] = useState(false)
  const [customSchemas, setCustomSchemas] = useState<NodeTypeSchema[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const template = getTemplateBySlug(categorySlug)
  const templateNodeTypes = template?.node_types ?? []

  // Merge template node types with custom schema types
  const customNodeTypes = customSchemas
    .filter((s) => !s.is_system && !templateNodeTypes.includes(s.node_type))
    .map((s) => s.node_type)
  const allNodeTypes = [...templateNodeTypes, ...customNodeTypes]

  const categoryName = language === 'en'
    ? (category.nameEn || category.name)
    : category.name

  // Load custom schemas
  const loadSchemas = useCallback(async () => {
    const schemas = await getNodeTypeSchemas(user.id)
    setCustomSchemas(schemas)
  }, [user.id])

  // Load or create the graph category, then load nodes
  const loadData = useCallback(async () => {
    try {
      // Try to get existing graph category by slug
      let cat = await getGraphCategoryBySlug(user.id, categorySlug)

      // If no graph category exists, create one from template
      if (!cat && template) {
        cat = await createGraphCategory(user.id, {
          slug: template.slug,
          name: template.name,
          name_en: template.name_en,
          icon: template.icon,
          color: template.color,
          description: template.description,
          template_slug: template.slug,
        })
      }

      if (cat) {
        setGraphCategory(cat)
        const result = await getCategoryWithNodes(cat.id)
        if (result) {
          setNodes(result.nodes)
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, categorySlug, template])

  useEffect(() => {
    loadData()
    loadSchemas()
  }, [loadData, loadSchemas])

  const handleNodeCreatedOrUpdated = () => {
    loadData()
  }

  const handleDeleteNode = async () => {
    if (!deletingNode) return
    const success = await deleteNode(deletingNode.id)
    if (success) {
      setDeletingNode(null)
      loadData()
    }
  }

  const handleOpenEdit = (node: Node) => {
    setEditingNode(node)
    setShowFormModal(true)
  }

  const handleOpenCreate = () => {
    setEditingNode(undefined)
    setShowFormModal(true)
  }

  const handleCloseForm = () => {
    setShowFormModal(false)
    setEditingNode(undefined)
  }

  const handleSchemasChange = useCallback((schemas: NodeTypeSchema[]) => {
    setCustomSchemas(schemas)
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Filter nodes by selected type and search query
  let filteredNodes = selectedType
    ? nodes.filter((n) => n.node_type === selectedType)
    : nodes

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filteredNodes = filteredNodes.filter((n) => {
      const titleMatch = (n.title || '').toLowerCase().includes(q)
      const propsMatch = Object.values(n.properties).some((v) =>
        String(v).toLowerCase().includes(q)
      )
      return titleMatch || propsMatch
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[var(--container-max)] md:max-w-[var(--container-wide)] mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-in">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              {t.nav.back}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {category.color && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: category.color }}
              />
            )}
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {categoryName}
            </span>
            {/* Module manager gear button */}
            <button
              onClick={() => setShowModuleManager(!showModuleManager)}
              className="w-6 h-6 rounded flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title={t.modules.title}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            {t.nodes.addNode}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : (
          <>
            {/* Module Manager Panel */}
            {showModuleManager && (
              <div
                className="mb-4 p-4 opacity-0 animate-fade-in"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <ModuleList
                  userId={user.id}
                  onSchemasChange={handleSchemasChange}
                />
              </div>
            )}

            {/* Search */}
            <div className="mb-4 opacity-0 animate-fade-in stagger-1">
              <NodeSearch onSearch={handleSearchChange} />
            </div>

            {/* View mode toggle + Filter */}
            <div className="flex items-center justify-between mb-4 opacity-0 animate-fade-in stagger-1">
              {allNodeTypes.length > 1 ? (
                <NodeTypeFilter
                  nodeTypes={allNodeTypes}
                  selectedType={selectedType}
                  onSelect={setSelectedType}
                />
              ) : (
                <div />
              )}

              {/* List / Graph toggle */}
              <div
                className="flex items-center rounded-md overflow-hidden flex-shrink-0"
                style={{ border: '1px solid var(--border-default)' }}
              >
                <button
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium transition-colors"
                  style={{
                    background: viewMode === 'list' ? 'var(--selected-bg)' : 'transparent',
                    color: viewMode === 'list' ? 'var(--selected-text)' : 'var(--text-muted)',
                  }}
                  title={t.nodes.listView}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium transition-colors"
                  style={{
                    background: viewMode === 'graph' ? 'var(--selected-bg)' : 'transparent',
                    color: viewMode === 'graph' ? 'var(--selected-text)' : 'var(--text-muted)',
                  }}
                  title={t.nodes.graphView}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content: Graph or List */}
            <div className="opacity-0 animate-fade-in stagger-2">
              {viewMode === 'graph' ? (
                <GraphView nodes={filteredNodes} userId={user.id} />
              ) : filteredNodes.length === 0 ? (
                <NodeEmptyState onAdd={handleOpenCreate} />
              ) : (
                <div className="space-y-2">
                  {filteredNodes.map((node) => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      onEdit={handleOpenEdit}
                      onDelete={setDeletingNode}
                      onAddRelation={setEdgeSourceNode}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Form Modal */}
      {graphCategory && (
        <NodeFormModal
          isOpen={showFormModal}
          onClose={handleCloseForm}
          onSubmit={handleNodeCreatedOrUpdated}
          node={editingNode}
          categoryId={graphCategory.id}
          userId={user.id}
          availableNodeTypes={allNodeTypes.length > 0 ? allNodeTypes : ['Item']}
        />
      )}

      {/* Delete Modal */}
      <DeleteNodeModal
        isOpen={!!deletingNode}
        onClose={() => setDeletingNode(null)}
        onConfirm={handleDeleteNode}
        nodeTitle={deletingNode?.title || ''}
      />

      {/* Add Edge Modal */}
      {edgeSourceNode && (
        <AddEdgeModal
          isOpen={!!edgeSourceNode}
          onClose={() => setEdgeSourceNode(null)}
          onCreated={() => {
            setEdgeSourceNode(null)
            loadData()
          }}
          sourceNodeId={edgeSourceNode.id}
          userId={user.id}
        />
      )}
    </div>
  )
}
