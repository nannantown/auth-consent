'use client'

import { useState, useMemo } from 'react'
import type { Node } from '@/types/graph'
import { useI18n } from '@/lib/i18n'

interface SkillRadarProps {
  skills: Node[]
  onCategoryClick?: (category: string) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  Programming: '#3b82f6',
  Language: '#8b5cf6',
  Management: '#f59e0b',
  Design: '#ec4899',
  Other: '#6b7280',
}

const CATEGORY_ORDER = ['Programming', 'Language', 'Management', 'Design', 'Other']

const CENTER = 150
const MAX_RADIUS = 110
const LABEL_OFFSET = 24
const LEVELS = 5

function getPoint(index: number, total: number, radius: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
}

function polygonPoints(total: number, radius: number): string {
  return Array.from({ length: total }, (_, i) => {
    const p = getPoint(i, total, radius)
    return `${CENTER + p.x},${CENTER + p.y}`
  }).join(' ')
}

interface CategoryData {
  name: string
  avgProficiency: number
  skillCount: number
  color: string
}

export function SkillRadar({ skills, onCategoryClick }: SkillRadarProps) {
  const { t: i18n } = useI18n()
  const ct = i18n.career
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const categoryData = useMemo(() => {
    const grouped = new Map<string, number[]>()
    for (const skill of skills) {
      const cat = (skill.properties as { category?: string }).category || 'Other'
      const proficiency = (skill.properties as { proficiency?: number }).proficiency || 1
      if (!grouped.has(cat)) grouped.set(cat, [])
      grouped.get(cat)!.push(proficiency)
    }

    const result: CategoryData[] = []
    for (const cat of CATEGORY_ORDER) {
      const values = grouped.get(cat)
      if (values && values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        result.push({
          name: cat,
          avgProficiency: avg,
          skillCount: values.length,
          color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other,
        })
      }
    }
    return result
  }, [skills])

  if (categoryData.length < 3) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {ct.minCategoriesMessage}
        </p>
      </div>
    )
  }

  const total = categoryData.length

  const dataPolygonPoints = categoryData
    .map((cat, i) => {
      const radius = (cat.avgProficiency / LEVELS) * MAX_RADIUS
      const p = getPoint(i, total, radius)
      return `${CENTER + p.x},${CENTER + p.y}`
    })
    .join(' ')

  const hoveredData = hoveredCategory
    ? categoryData.find((c) => c.name === hoveredCategory)
    : null

  const hoveredIndex = hoveredCategory
    ? categoryData.findIndex((c) => c.name === hoveredCategory)
    : -1

  let tooltipX = CENTER
  let tooltipY = CENTER
  if (hoveredData && hoveredIndex >= 0) {
    const radius = (hoveredData.avgProficiency / LEVELS) * MAX_RADIUS
    const p = getPoint(hoveredIndex, total, radius)
    tooltipX = CENTER + p.x
    tooltipY = CENTER + p.y
  }

  const categoryLabel = (name: string): string => {
    return ct.categories[name as keyof typeof ct.categories] || name
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {ct.skillRadar}
        </span>
      </div>

      <div className="flex justify-center p-4">
        <svg
          viewBox="0 0 300 300"
          width="100%"
          style={{ maxWidth: 320 }}
          role="img"
          aria-label={ct.skillRadar}
        >
          <defs>
            <radialGradient id="radar-fill-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </radialGradient>
          </defs>

          {/* Grid polygons */}
          {Array.from({ length: LEVELS }, (_, level) => {
            const radius = ((level + 1) / LEVELS) * MAX_RADIUS
            const isOuter = level === LEVELS - 1
            return (
              <polygon
                key={level}
                points={polygonPoints(total, radius)}
                fill="none"
                stroke={isOuter ? 'var(--border-default)' : 'var(--border-subtle)'}
                strokeWidth={isOuter ? 1 : 0.5}
              />
            )
          })}

          {/* Axis lines */}
          {categoryData.map((_, i) => {
            const p = getPoint(i, total, MAX_RADIUS)
            return (
              <line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={CENTER + p.x}
                y2={CENTER + p.y}
                stroke="var(--border-subtle)"
                strokeWidth={0.5}
              />
            )
          })}

          {/* Data area */}
          <g style={{ transformOrigin: `${CENTER}px ${CENTER}px` }} className="radar-data-area">
            <polygon
              points={dataPolygonPoints}
              fill="url(#radar-fill-gradient)"
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />

            {/* Data points */}
            {categoryData.map((cat, i) => {
              const radius = (cat.avgProficiency / LEVELS) * MAX_RADIUS
              const p = getPoint(i, total, radius)
              return (
                <circle
                  key={cat.name}
                  cx={CENTER + p.x}
                  cy={CENTER + p.y}
                  r={5}
                  fill={cat.color}
                  stroke="var(--bg-primary)"
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${categoryLabel(cat.name)}: ${cat.avgProficiency.toFixed(1)}`}
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onFocus={() => setHoveredCategory(cat.name)}
                  onBlur={() => setHoveredCategory(null)}
                  onClick={() => onCategoryClick?.(cat.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onCategoryClick?.(cat.name)
                    }
                  }}
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                />
              )
            })}
          </g>

          {/* Category labels */}
          {categoryData.map((cat, i) => {
            const p = getPoint(i, total, MAX_RADIUS + LABEL_OFFSET)
            const x = CENTER + p.x
            const y = CENTER + p.y
            let anchor: 'middle' | 'start' | 'end' = 'middle'
            if (p.x > 5) anchor = 'start'
            else if (p.x < -5) anchor = 'end'
            return (
              <text
                key={cat.name}
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline="central"
                fontSize={11}
                fontWeight={500}
                fill="var(--text-muted)"
                style={{ cursor: 'pointer' }}
                onClick={() => onCategoryClick?.(cat.name)}
              >
                {categoryLabel(cat.name)}
              </text>
            )
          })}

          {/* Tooltip */}
          {hoveredData && (
            <g
              transform={`translate(${tooltipX}, ${tooltipY - 52})`}
              style={{ pointerEvents: 'none' }}
            >
              <rect
                x={-60}
                y={-8}
                width={120}
                height={48}
                rx={6}
                fill="var(--bg-surface)"
                stroke="var(--border-default)"
                strokeWidth={1}
              />
              <text
                x={0}
                y={6}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="var(--text-primary)"
              >
                {categoryLabel(hoveredData.name)}
              </text>
              <text
                x={0}
                y={20}
                textAnchor="middle"
                fontSize={10}
                fill="var(--text-muted)"
              >
                {ct.avgProficiency}: {hoveredData.avgProficiency.toFixed(1)}
              </text>
              <text
                x={0}
                y={32}
                textAnchor="middle"
                fontSize={10}
                fill="var(--text-muted)"
              >
                {hoveredData.skillCount} {ct.skills}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}
