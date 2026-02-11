'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getCategories, getSharingRules } from '@/lib/graph'
import { BackButton } from '@/components/ui/BackButton'
import { SharingRuleList } from '@/components/sharing'
import { useI18n } from '@/lib/i18n'
import type { Category, SharingRule } from '@/types/graph'

export default function SharingSettingsPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [userId, setUserId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [sharingRules, setSharingRules] = useState<SharingRule[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const loadData = useCallback(async (uid: string) => {
    const [cats, rules] = await Promise.all([
      getCategories(uid),
      getSharingRules(uid),
    ])
    setCategories(cats)
    setSharingRules(rules)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/dashboard/sharing')
        return
      }
      setUserId(user.id)
      await loadData(user.id)
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase, loadData])

  const handleRulesChange = useCallback(() => {
    if (userId) {
      loadData(userId)
    }
  }, [userId, loadData])

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: 'var(--text-muted)',
            borderTopColor: 'transparent',
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[var(--container-max)] mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-6 opacity-0 animate-fade-in">
          <BackButton href="/dashboard" />
        </div>

        {/* Title */}
        <div className="mb-6 opacity-0 animate-fade-in stagger-1">
          <h1
            className="text-base font-medium mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {t.sharing.title}
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t.sharing.description}
          </p>
        </div>

        {/* Sharing Rules */}
        <div className="opacity-0 animate-fade-in stagger-2">
          {userId && (
            <SharingRuleList
              userId={userId}
              categories={categories}
              sharingRules={sharingRules}
              onRulesChange={handleRulesChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}
