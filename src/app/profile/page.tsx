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
import {
  ProfileHeader,
  ProfileSection,
} from '@/components/profile'
import { useI18n } from '@/lib/i18n'

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<FullProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  const supabase = createClient()

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
        router.push('/login?redirect=/profile')
        return
      }
      setUser(user)
      await loadProfile(user.id)
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase, loadProfile])

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/')
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
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Top Navigation */}
        <nav className="flex items-center justify-between mb-8 opacity-0 animate-fade-in">
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

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5 disabled:opacity-50"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {loggingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {t.nav.loggingOut}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t.nav.logout}
              </>
            )}
          </button>
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

        {/* Basic Info Section */}
        <div className="opacity-0 animate-fade-in stagger-2">
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
        <div className="mt-12 text-center opacity-0 animate-fade-in stagger-3">
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            Powered by Centra
          </p>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--centra-primary), var(--centra-secondary), var(--centra-accent), transparent)',
        }}
      />
    </div>
  )
}
