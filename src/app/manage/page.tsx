'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ManagePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Logged in - go to dashboard
        router.push('/dashboard')
      } else {
        // Not logged in - go to manage login
        router.push('/manage/login')
      }
    }
    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--centra-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
