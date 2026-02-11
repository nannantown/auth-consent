'use client'

import { useState, useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n'

interface NodeSearchProps {
  onSearch: (query: string) => void
}

export function NodeSearch({ onSearch }: NodeSearchProps) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [query, onSearch])

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
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
        className="input"
        style={{ paddingLeft: '2rem' }}
      />
    </div>
  )
}
