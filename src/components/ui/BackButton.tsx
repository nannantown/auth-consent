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
      className={`inline-flex items-center gap-2 text-sm transition-colors hover:underline ${className}`}
      style={{ color: 'var(--foreground-muted)' }}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label || t.nav.back}
    </button>
  )
}
