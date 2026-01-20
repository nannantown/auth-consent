'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'

export default function Home() {
  const router = useRouter()
  const { t } = useI18n()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
        return
      }
      setChecking(false)
    }
    checkAuth()
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-30 blur-3xl animate-float"
          style={{ background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-secondary))' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float"
          style={{ background: 'linear-gradient(135deg, var(--centra-accent), var(--centra-primary))', animationDelay: '2s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--centra-primary) 0%, transparent 70%)' }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Logo & Title */}
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          {/* Logo Mark */}
          <div className="mb-6 inline-flex items-center justify-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center animate-float"
              style={{
                background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-primary-dark))',
                boxShadow: '0 0 60px -10px var(--centra-primary)'
              }}
            >
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="16" cy="16" r="5" fill="white"/>
              </svg>
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 gradient-text">
            Centra
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl max-w-md mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            あなたのデータを、あなたの手に。
            <br />
            <span className="text-sm">Your data, your control.</span>
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="opacity-0 animate-fade-in stagger-2 flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="btn btn-primary px-8 py-4 text-lg"
          >
            {t.login.button}
          </Link>
          <Link
            href="/signup"
            className="btn btn-secondary px-8 py-4 text-lg"
          >
            {t.signup.button}
          </Link>
        </div>

        {/* Management Dashboard Link */}
        <div className="mt-8 opacity-0 animate-fade-in stagger-2">
          <Link
            href="/manage"
            className="text-sm hover:underline"
            style={{ color: 'var(--foreground-muted)' }}
          >
            管理画面へ
          </Link>
        </div>

      </div>

      {/* Footer Accent Line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(90deg, var(--centra-primary), var(--centra-secondary), var(--centra-accent))' }}
      />
    </div>
  )
}
