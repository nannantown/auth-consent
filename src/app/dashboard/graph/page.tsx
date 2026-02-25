'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { getNodes } from '@/lib/graph'
import { NeighborhoodExplorer } from '@/components/graph'
import { useI18n } from '@/lib/i18n'
import type { Node } from '@/types/graph'

export default function GraphPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/dashboard/graph')
        return
      }
      setUser(user)

      const allNodes = await getNodes(user.id)
      setNodes(allNodes)
      setLoading(false)
    }
    init()
  }, [router, supabase])

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
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
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
          className="text-xl font-semibold tracking-tight mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {t.nav.graph}
        </h1>

        {/* Graph */}
        {nodes.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {t.nodes.noNodes}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {t.nodes.noNodesDescription}
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <NeighborhoodExplorer
              userId={user.id}
              nodes={nodes}
            />
          </div>
        )}
      </div>
    </div>
  )
}
