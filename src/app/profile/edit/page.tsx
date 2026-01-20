'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { getProfile, upsertProfile } from '@/lib/profile'
import { Profile, ProfileInput } from '@/types/profile'
import { BasicInfoForm } from '@/components/profile'
import { useI18n } from '@/lib/i18n'

export default function EditProfilePage() {
  const router = useRouter()
  const { t } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const data = await getProfile(supabase, userId)
      setProfile(data)
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }, [supabase])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/profile/edit')
        return
      }
      setUser(user)
      await loadProfile(user.id)
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase, loadProfile])

  const handleSave = async (data: Partial<ProfileInput>) => {
    if (!user) return
    await upsertProfile(supabase, user.id, data)
    router.push('/dashboard/profile')
  }

  const handleCancel = () => {
    router.push('/dashboard/profile')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="flex items-center gap-2 text-sm transition-colors mb-4"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.profile?.backToProfile || t.nav.back}
          </button>
          <h1 className="text-2xl font-bold gradient-text">
            {t.profile?.editBasicInfo || 'Edit Basic Information'}
          </h1>
        </div>

        {/* Form */}
        <div className="card-elevated">
          <BasicInfoForm
            profile={profile}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  )
}
