'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { HABIT_PRINCIPLES, HABIT_PRINCIPLE_LABELS } from '@/types/graph'
import type { HabitPrinciple } from '@/types/graph'

export function HabitPrincipleGuide() {
  const { t, language } = useI18n()
  const [expanded, setExpanded] = useState(false)

  const principleIcons: Record<HabitPrinciple, string> = {
    act_first: 'M13 10V3L4 14h7v7l9-11h-7z',
    habit_stacking: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    environment_design: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  }

  const principleColors: Record<HabitPrinciple, string> = {
    act_first: 'var(--warning)',
    habit_stacking: 'var(--info)',
    environment_design: 'var(--success)',
  }

  return (
    <div
      className="card px-4 py-3"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {t.habits.principles}
          </span>
        </div>
        <svg
          className="w-3.5 h-3.5 transition-transform"
          style={{
            color: 'var(--text-muted)',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t.habits.principlesSubtitle}
          </p>
          {Object.values(HABIT_PRINCIPLES).map((principle) => {
            const labels = HABIT_PRINCIPLE_LABELS[principle]
            return (
              <div
                key={principle}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: 'var(--bg-surface)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `color-mix(in srgb, ${principleColors[principle]} 20%, transparent)` }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: principleColors[principle] }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={principleIcons[principle]} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {language === 'en' ? labels.en : labels.ja}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'en' ? labels.description_en : labels.description_ja}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
