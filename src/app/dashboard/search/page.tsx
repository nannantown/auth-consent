'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { getNodes, getCategories } from '@/lib/graph'
import type { Node, Category } from '@/types/graph'
import { useI18n } from '@/lib/i18n'

export default function SearchPage() {
  const router = useRouter()
  const { t, language } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [allNodes, setAllNodes] = useState<Node[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/dashboard/search')
        return
      }
      setUser(user)

      const [nodes, cats] = await Promise.all([
        getNodes(user.id),
        getCategories(user.id),
      ])
      setAllNodes(nodes)
      setCategories(cats)
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  const getCategoryForNode = useCallback((node: Node): Category | undefined => {
    return categories.find((c) => c.id === node.category_id)
  }, [categories])

  // Filter nodes by search
  const filteredNodes = debouncedQuery.trim()
    ? allNodes.filter((n) => {
        const q = debouncedQuery.toLowerCase()
        const titleMatch = (n.title || '').toLowerCase().includes(q)
        const typeMatch = n.node_type.toLowerCase().includes(q)
        const propsMatch = Object.values(n.properties).some((v) =>
          String(v).toLowerCase().includes(q)
        )
        return titleMatch || typeMatch || propsMatch
      })
    : []

  // Group by category
  const groupedResults = filteredNodes.reduce<Record<string, { category: Category | undefined; nodes: Node[] }>>(
    (acc, node) => {
      const catId = node.category_id
      if (!acc[catId]) {
        acc[catId] = { category: getCategoryForNode(node), nodes: [] }
      }
      acc[catId].nodes.push(node)
      return acc
    },
    {}
  )

  const resultCount = filteredNodes.length

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[var(--container-max)] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-in">
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

          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {t.search.title}
          </span>

          <div className="w-14" />
        </div>

        {/* Search Input */}
        <div className="relative mb-6 opacity-0 animate-fade-in stagger-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'var(--text-muted)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            className="input text-sm"
            style={{ paddingLeft: '2.25rem' }}
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="opacity-0 animate-fade-in stagger-2">
          {debouncedQuery.trim() && (
            <p
              className="text-xs mb-4"
              style={{ color: 'var(--text-muted)' }}
            >
              {t.search.resultCount.replace('{count}', String(resultCount))}
            </p>
          )}

          {debouncedQuery.trim() && filteredNodes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg
                className="w-12 h-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: 'var(--text-muted)', opacity: 0.3, strokeWidth: 1.5 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <p
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.search.noResults}
              </p>
            </div>
          )}

          {Object.entries(groupedResults).map(([catId, { category, nodes }]) => {
            const catName = category
              ? (language === 'en' && category.name_en ? category.name_en : category.name)
              : t.search.allSpaces
            const catSlug = category?.slug

            return (
              <div key={catId} className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {category?.color && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: category.color }}
                    />
                  )}
                  <span className="label">{catName}</span>
                </div>
                <div className="space-y-2">
                  {nodes.map((node) => (
                    <Link
                      key={node.id}
                      href={catSlug ? `/dashboard/${catSlug}` : '/dashboard'}
                      className="card-interactive px-4 py-3 block"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-medium truncate"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {node.title || node.node_type}
                            </span>
                            <span
                              className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                color: 'var(--text-muted)',
                              }}
                            >
                              {node.node_type}
                            </span>
                          </div>
                        </div>
                        <svg
                          className="w-3.5 h-3.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
