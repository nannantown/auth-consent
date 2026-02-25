'use client'

import type { Node } from '@/types/graph'

interface CareerStatsProps {
  workExperiences: Node[]
  skills: Node[]
  language: string
}

function calculateTotalYears(workExperiences: Node[]): number {
  let totalMonths = 0
  for (const node of workExperiences) {
    const props = node.properties as { start_date?: string; end_date?: string }
    if (!props.start_date) continue

    const start = new Date(props.start_date + '-01')
    const end = props.end_date ? new Date(props.end_date + '-01') : new Date()
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    totalMonths += Math.max(0, months)
  }
  return Math.round(totalMonths / 12 * 10) / 10
}

function getCurrentRole(workExperiences: Node[]): string | null {
  const current = workExperiences.find((node) => {
    const props = node.properties as { end_date?: string }
    return !props.end_date
  })
  if (!current) return null
  const props = current.properties as { role?: string; company?: string }
  return props.role || null
}

function getCompanyCount(workExperiences: Node[]): number {
  const companies = new Set<string>()
  for (const node of workExperiences) {
    const props = node.properties as { company?: string }
    if (props.company) companies.add(props.company)
  }
  return companies.size
}

export function CareerStats({ workExperiences, skills, language }: CareerStatsProps) {
  const totalYears = calculateTotalYears(workExperiences)
  const companyCount = getCompanyCount(workExperiences)
  const currentRole = getCurrentRole(workExperiences)
  const skillCount = skills.length

  const stats = [
    {
      label: language === 'en' ? 'Total Experience' : '総経験年数',
      value: totalYears > 0 ? `${totalYears}` : '-',
      suffix: language === 'en' ? 'years' : '年',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: language === 'en' ? 'Companies' : '企業数',
      value: companyCount > 0 ? `${companyCount}` : '-',
      suffix: null,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: language === 'en' ? 'Current Role' : '現在の役職',
      value: currentRole || (language === 'en' ? '-' : '-'),
      suffix: null,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: language === 'en' ? 'Skills' : 'スキル数',
      value: skillCount > 0 ? `${skillCount}` : '-',
      suffix: null,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`rounded-xl p-4 animate-fade-in stagger-${index + 1}`}
          style={{
            background: 'var(--bg-translucent)',
            border: '1px solid var(--border-subtle)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}
            >
              {stat.icon}
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {stat.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-xl font-bold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {stat.value}
            </span>
            {stat.suffix && (
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {stat.suffix}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
