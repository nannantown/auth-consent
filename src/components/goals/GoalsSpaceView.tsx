'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Category } from '@/types/category'
import { useI18n } from '@/lib/i18n'
import { GoalsView } from './GoalsView'
import { HabitTrackerView } from './HabitTrackerView'

interface GoalsSpaceViewProps {
  user: User
  categorySlug: string
  category: Category
  language: string
}

type Tab = 'goals' | 'habits'

export function GoalsSpaceView({ user, categorySlug, category, language }: GoalsSpaceViewProps) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<Tab>('goals')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'goals', label: t.goals.tabGoals },
    { key: 'habits', label: t.goals.tabHabits },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={activeTab === tab.key ? 'pill-filter-active' : 'pill-filter'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'goals' && (
        <GoalsView
          user={user}
          categorySlug={categorySlug}
          category={category}
          language={language}
        />
      )}

      {activeTab === 'habits' && (
        <HabitTrackerView
          user={user}
          categorySlug={categorySlug}
          category={category}
          language={language}
        />
      )}
    </div>
  )
}
