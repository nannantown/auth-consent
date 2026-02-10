'use client'

import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ href, label, className = '' }: BackButtonProps) {
  const router = useRouter()
  const { t } = useI18n()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-xs transition-colors ${className}`}
      style={{ color: 'var(--text-muted)' }}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
      </svg>
      {label || t.nav.back}
    </button>
  )
}
